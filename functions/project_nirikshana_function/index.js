'use strict';
const catalyst = require('zcatalyst-sdk-node');
const express = require('express');
const app = express();
app.use(express.json());

const DISTRICTS = [
	{ name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
	{ name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
	{ name: 'Mangaluru (Dakshina Kannada)', lat: 12.9141, lng: 74.8560 },
	{ name: 'Belagavi', lat: 15.8497, lng: 74.4977 },
	{ name: 'Hubballi-Dharwad', lat: 15.3647, lng: 75.1240 },
	{ name: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
	{ name: 'Ballari', lat: 15.1394, lng: 76.9214 },
	{ name: 'Shivamogga', lat: 13.9299, lng: 75.5681 },
	{ name: 'Tumakuru', lat: 13.3392, lng: 77.1139 },
	{ name: 'Udupi', lat: 13.3409, lng: 74.7421 }
];

const CRIME_TYPES = [
	{ head: 'Theft', group: 'Crimes Against Property' },
	{ head: 'Robbery', group: 'Crimes Against Property' },
	{ head: 'Burglary', group: 'Crimes Against Property' },
	{ head: 'Vehicle Theft', group: 'Crimes Against Property' },
	{ head: 'Assault', group: 'Crimes Against Body' },
	{ head: 'Murder', group: 'Crimes Against Body' },
	{ head: 'Kidnapping', group: 'Crimes Against Body' },
	{ head: 'Cyber Fraud', group: 'Cyber Crime' },
	{ head: 'Online Scam', group: 'Cyber Crime' },
	{ head: 'Domestic Violence', group: 'Crimes Against Women' },
	{ head: 'Chain Snatching', group: 'Crimes Against Property' },
	{ head: 'Drug Peddling', group: 'Narcotics' }
];

const CASE_STATUSES = ['Under Investigation', 'Charge Sheeted', 'Closed', 'Undetected'];
const GENDERS = ['M', 'F', 'T'];
const FIRST_NAMES = ['Rajesh', 'Suresh', 'Manjunath', 'Prakash', 'Ramesh', 'Naveen', 'Ganesh', 'Vinay', 'Ravi', 'Kiran', 'Arjun', 'Anil', 'Deepak', 'Vijay', 'Santosh', 'Mahesh', 'Nagaraj', 'Shivaraj', 'Yogesh', 'Girish'];
const LAST_NAMES = ['Gowda', 'Kumar', 'Reddy', 'Naik', 'Shetty', 'Rao', 'Patil', 'Hegde', 'Iyer', 'Achar', 'Poojari', 'Bhat'];
const REPEAT_OFFENDER_NAMES = ['Manjunath Gowda', 'Suresh Naik', 'Prakash Shetty', 'Ravi Kumar Reddy', 'Naveen Patil', 'Ganesh Rao', 'Vinay Hegde'];

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, decimals = 6) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
function randomName() { return `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`; }
function randomDateBetween(startYear, endYear) {
	const start = new Date(startYear, 0, 1).getTime();
	const end = new Date(endYear, 11, 31).getTime();
	return new Date(start + Math.random() * (end - start));
}
function toDateString(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function toDateTimeString(d) { return `${toDateString(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`; }

async function bulkInsertChunked(table, rows, chunkSize = 100) {
	const inserted = [];
	for (let i = 0; i < rows.length; i += chunkSize) {
		const chunk = rows.slice(i, i + chunkSize);
		const result = await table.insertRows(chunk);
		inserted.push(...result);
	}
	return inserted;
}

app.post('/seed', async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const datastore = catalystApp.datastore();
		const districtTable = datastore.table('District');
		const crimeSubHeadTable = datastore.table('CrimeSubHead');
		const unitTable = datastore.table('Unit');
		const caseMasterTable = datastore.table('CaseMaster');
		const accusedTable = datastore.table('Accused');

		const districtRows = DISTRICTS.map(d => ({ DistrictName: d.name, Active: true }));
		const insertedDistricts = await bulkInsertChunked(districtTable, districtRows);
		const districtsWithIds = insertedDistricts.map((row, idx) => ({ rowid: row.ROWID, name: DISTRICTS[idx].name, lat: DISTRICTS[idx].lat, lng: DISTRICTS[idx].lng }));

		const crimeRows = CRIME_TYPES.map(c => ({ CrimeHeadName: c.head, CrimeGroupName: c.group }));
		const insertedCrimes = await bulkInsertChunked(crimeSubHeadTable, crimeRows);
		const crimesWithIds = insertedCrimes.map((row, idx) => ({ rowid: row.ROWID, head: CRIME_TYPES[idx].head }));

		const unitRows = [];
		const unitDistrictMap = [];
		districtsWithIds.forEach(d => {
			for (let i = 1; i <= 3; i++) {
				unitRows.push({ UnitName: `${d.name} PS-${i}`, DistrictID: d.rowid, Active: true });
				unitDistrictMap.push(d);
			}
		});
		const insertedUnits = await bulkInsertChunked(unitTable, unitRows);
		const unitsWithIds = insertedUnits.map((row, idx) => ({ rowid: row.ROWID, district: unitDistrictMap[idx] }));

		const TOTAL_CASES = 800;
		const caseRows = [];
		for (let i = 0; i < TOTAL_CASES; i++) {
			const unit = randomChoice(unitsWithIds);
			const crime = randomChoice(crimesWithIds);
			const incidentDate = randomDateBetween(2025, 2026);
			const lat = randomFloat(unit.district.lat - 0.08, unit.district.lat + 0.08);
			const lng = randomFloat(unit.district.lng - 0.08, unit.district.lng + 0.08);
			caseRows.push({
				CrimeNo: `FIR${randomInt(100000, 999999)}`,
				CrimeRegisteredDate: toDateString(incidentDate),
				PoliceStationID: unit.rowid,
				CrimeSubHeadID: crime.rowid,
				CaseStatus: randomChoice(CASE_STATUSES),
				IncidentDate: toDateTimeString(incidentDate),
				Latitude: lat,
				Longitude: lng,
				BriefFacts: `${crime.head} reported near ${unit.district.name}`
			});
		}

		const spikeDistrict = districtsWithIds[0];
		const spikeUnit = unitsWithIds.find(u => u.district.rowid === spikeDistrict.rowid);
		const theftCrime = crimesWithIds.find(c => c.head === 'Theft') || crimesWithIds[0];
		for (let i = 0; i < 25; i++) {
			const d = new Date(2026, 5, randomInt(1, 28));
			caseRows.push({
				CrimeNo: `FIR${randomInt(100000, 999999)}`,
				CrimeRegisteredDate: toDateString(d),
				PoliceStationID: spikeUnit.rowid,
				CrimeSubHeadID: theftCrime.rowid,
				CaseStatus: randomChoice(CASE_STATUSES),
				IncidentDate: toDateTimeString(d),
				Latitude: randomFloat(spikeDistrict.lat - 0.03, spikeDistrict.lat + 0.03),
				Longitude: randomFloat(spikeDistrict.lng - 0.03, spikeDistrict.lng + 0.03),
				BriefFacts: `Theft reported near ${spikeDistrict.name}`
			});
		}

		const insertedCases = await bulkInsertChunked(caseMasterTable, caseRows);

		const accusedRows = [];
		const TOTAL_ACCUSED = 350;
		for (let i = 0; i < TOTAL_ACCUSED; i++) {
			const caseRow = randomChoice(insertedCases);
			const useRepeat = Math.random() < 0.2;
			const name = useRepeat ? randomChoice(REPEAT_OFFENDER_NAMES) : randomName();
			accusedRows.push({ CaseMasterID: caseRow.ROWID, AccusedName: name, AgeYear: randomInt(18, 55), GenderID: randomChoice(GENDERS) });
		}
		REPEAT_OFFENDER_NAMES.forEach(name => {
			for (let i = 0; i < 3; i++) {
				const caseRow = randomChoice(insertedCases);
				accusedRows.push({ CaseMasterID: caseRow.ROWID, AccusedName: name, AgeYear: randomInt(25, 45), GenderID: 'M' });
			}
		});

		await bulkInsertChunked(accusedTable, accusedRows);

		res.status(200).json({ status: 'success', districts: insertedDistricts.length, crimeTypes: insertedCrimes.length, units: insertedUnits.length, cases: insertedCases.length, accused: accusedRows.length });
	} catch (error) {
		console.error('Seeding error:', error);
		res.status(500).json({ status: 'error', message: error.message, stack: error.stack });
	}
});

app.get('/cases', async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const zcql = catalystApp.zcql();
		const casesResult = await zcql.executeZCQLQuery('SELECT * FROM CaseMaster LIMIT 300');
		const crimeTypesResult = await zcql.executeZCQLQuery('SELECT * FROM CrimeSubHead');
		const unitsResult = await zcql.executeZCQLQuery('SELECT * FROM Unit');

		const crimeTypeMap = {};
		crimeTypesResult.forEach(row => { crimeTypeMap[row.CrimeSubHead.ROWID] = row.CrimeSubHead.CrimeHeadName; });
		const unitMap = {};
		unitsResult.forEach(row => { unitMap[row.Unit.ROWID] = row.Unit.UnitName; });

		const cases = casesResult.map(row => {
			const c = row.CaseMaster;
			return {
				id: c.ROWID,
				lat: parseFloat(c.Latitude),
				lng: parseFloat(c.Longitude),
				date: c.CrimeRegisteredDate,
				status: c.CaseStatus,
				crimeType: crimeTypeMap[c.CrimeSubHeadID] || 'Unknown',
				station: unitMap[c.PoliceStationID] || 'Unknown'
			};
		});

		res.status(200).json({ status: 'success', count: cases.length, cases });
	} catch (error) {
		console.error('Fetch cases error:', error);
		res.status(500).json({ status: 'error', message: error.message });
	}
});

app.get('/stats', async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const zcql = catalystApp.zcql();
		const casesResult = await zcql.executeZCQLQuery('SELECT ROWID, CrimeSubHeadID FROM CaseMaster');
		const crimeTypesResult = await zcql.executeZCQLQuery('SELECT * FROM CrimeSubHead');
		const districtResult = await zcql.executeZCQLQuery('SELECT ROWID FROM District');

		const crimeTypeMap = {};
		crimeTypesResult.forEach(row => { crimeTypeMap[row.CrimeSubHead.ROWID] = row.CrimeSubHead.CrimeHeadName; });

		const counts = {};
		casesResult.forEach(row => {
			const name = crimeTypeMap[row.CaseMaster.CrimeSubHeadID] || 'Unknown';
			counts[name] = (counts[name] || 0) + 1;
		});
		let topCrimeType = 'N/A';
		let maxCount = 0;
		Object.entries(counts).forEach(([name, count]) => { if (count > maxCount) { maxCount = count; topCrimeType = name; } });

		res.status(200).json({ status: 'success', totalCases: casesResult.length, topCrimeType, totalDistricts: districtResult.length });
	} catch (error) {
		console.error('Stats error:', error);
		res.status(500).json({ status: 'error', message: error.message });
	}
});

// DBSCAN Hotspot Detection Endpoint
app.get('/hotspots', async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const zcql = catalystApp.zcql();
		const casesResult = await zcql.executeZCQLQuery('SELECT * FROM CaseMaster LIMIT 300');
		const crimeTypesResult = await zcql.executeZCQLQuery('SELECT * FROM CrimeSubHead');
		const unitsResult = await zcql.executeZCQLQuery('SELECT * FROM Unit');

		const crimeTypeMap = {};
		crimeTypesResult.forEach(row => { crimeTypeMap[row.CrimeSubHead.ROWID] = row.CrimeSubHead.CrimeHeadName; });
		const unitMap = {};
		unitsResult.forEach(row => { unitMap[row.Unit.ROWID] = row.Unit.UnitName; });

		const points = casesResult.map(row => {
			const c = row.CaseMaster;
			return {
				id: c.ROWID,
				lat: parseFloat(c.Latitude),
				lng: parseFloat(c.Longitude),
				date: c.CrimeRegisteredDate,
				crimeType: crimeTypeMap[c.CrimeSubHeadID] || 'Unknown',
				station: unitMap[c.PoliceStationID] || 'Unknown'
			};
		}).filter(p => !isNaN(p.lat) && !isNaN(p.lng));

		// Simple DBSCAN clustering implementation
		const eps = 0.06; // Radius threshold (~6.5 km)
		const minPts = 3;
		const visited = new Set();
		const clusters = [];

		function getNeighbors(p) {
			return points.filter(other => {
				const d = Math.sqrt(Math.pow(p.lat - other.lat, 2) + Math.pow(p.lng - other.lng, 2));
				return d <= eps;
			});
		}

		for (const p of points) {
			if (visited.has(p.id)) continue;
			visited.add(p.id);
			const neighbors = getNeighbors(p);
			if (neighbors.length >= minPts) {
				const clusterPts = [...neighbors];
				neighbors.forEach(n => visited.add(n.id));
				
				const avgLat = clusterPts.reduce((sum, pt) => sum + pt.lat, 0) / clusterPts.length;
				const avgLng = clusterPts.reduce((sum, pt) => sum + pt.lng, 0) / clusterPts.length;
				
				const crimeCounts = {};
				clusterPts.forEach(pt => { crimeCounts[pt.crimeType] = (crimeCounts[pt.crimeType] || 0) + 1; });
				let dominantCrime = 'General Crime';
				let maxC = 0;
				Object.entries(crimeCounts).forEach(([ct, c]) => { if (c > maxC) { maxC = c; dominantCrime = ct; } });

				const juneTheftSpike = clusterPts.filter(pt => pt.crimeType === 'Theft' && pt.date && pt.date.startsWith('2026-06')).length >= 3;

				clusters.push({
					id: `HOTSPOT_${clusters.length + 1}`,
					lat: parseFloat(avgLat.toFixed(6)),
					lng: parseFloat(avgLng.toFixed(6)),
					totalIncidents: clusterPts.length,
					dominantCrime,
					primaryStation: clusterPts[0].station,
					isAnomaly: juneTheftSpike || clusterPts.length >= 6,
					anomalyReason: juneTheftSpike ? 'Detected unusual June 2026 theft surge' : clusterPts.length >= 6 ? 'High density crime cluster' : 'Standard hotspot'
				});
			}
		}

		res.status(200).json({ status: 'success', totalHotspots: clusters.length, hotspots: clusters });
	} catch (error) {
		console.error('Hotspots error:', error);
		res.status(500).json({ status: 'error', message: error.message });
	}
});

// Network / Link Graph for Repeat Offenders
app.get('/network', async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const zcql = catalystApp.zcql();
		const accusedResult = await zcql.executeZCQLQuery('SELECT * FROM Accused LIMIT 300');
		const casesResult = await zcql.executeZCQLQuery('SELECT * FROM CaseMaster LIMIT 300');
		const unitsResult = await zcql.executeZCQLQuery('SELECT * FROM Unit');
		const crimeTypesResult = await zcql.executeZCQLQuery('SELECT * FROM CrimeSubHead');

		const unitMap = {};
		unitsResult.forEach(row => { unitMap[row.Unit.ROWID] = row.Unit.UnitName; });
		const crimeMap = {};
		crimeTypesResult.forEach(row => { crimeMap[row.CrimeSubHead.ROWID] = row.CrimeSubHead.CrimeHeadName; });
		const caseMap = {};
		casesResult.forEach(row => {
			const c = row.CaseMaster;
			caseMap[c.ROWID] = {
				id: c.ROWID,
				crimeNo: c.CrimeNo,
				station: unitMap[c.PoliceStationID] || 'Station',
				crimeType: crimeMap[c.CrimeSubHeadID] || 'Crime'
			};
		});

		const offenderCases = {};
		accusedResult.forEach(row => {
			const a = row.Accused;
			if (!offenderCases[a.AccusedName]) {
				offenderCases[a.AccusedName] = { name: a.AccusedName, age: a.AgeYear, gender: a.GenderID, cases: [] };
			}
			if (caseMap[a.CaseMasterID]) {
				offenderCases[a.AccusedName].cases.push(caseMap[a.CaseMasterID]);
			}
		});

		// Filter repeat offenders (3+ linked cases)
		const repeatOffenders = Object.values(offenderCases).filter(o => o.cases.length >= 3);

		const nodes = [];
		const links = [];
		const addedNodes = new Set();

		repeatOffenders.forEach(offender => {
			const offenderNodeId = `OFFENDER_${offender.name.replace(/\s+/g, '_')}`;
			if (!addedNodes.has(offenderNodeId)) {
				nodes.push({ id: offenderNodeId, label: offender.name, type: 'offender', casesCount: offender.cases.length });
				addedNodes.add(offenderNodeId);
			}

			offender.cases.forEach(c => {
				const caseNodeId = `CASE_${c.id}`;
				if (!addedNodes.has(caseNodeId)) {
					nodes.push({ id: caseNodeId, label: `${c.crimeNo} (${c.crimeType})`, type: 'case', station: c.station });
					addedNodes.add(caseNodeId);
				}

				links.push({ source: offenderNodeId, target: caseNodeId, relationship: 'ACCUSED_IN' });
			});
		});

		res.status(200).json({
			status: 'success',
			repeatOffenderCount: repeatOffenders.length,
			repeatOffenders: repeatOffenders.map(r => ({ name: r.name, casesLinked: r.cases.length, sampleStation: r.cases[0]?.station })),
			nodes,
			links
		});
	} catch (error) {
		console.error('Network error:', error);
		res.status(500).json({ status: 'error', message: error.message });
	}
});

// Risk Scoring Endpoint
app.get('/risk-scores', async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const zcql = catalystApp.zcql();
		const casesResult = await zcql.executeZCQLQuery('SELECT * FROM CaseMaster LIMIT 300');
		const unitsResult = await zcql.executeZCQLQuery('SELECT * FROM Unit');
		const crimeTypesResult = await zcql.executeZCQLQuery('SELECT * FROM CrimeSubHead');

		const unitMap = {};
		unitsResult.forEach(row => { unitMap[row.Unit.ROWID] = row.Unit.UnitName; });
		const crimeMap = {};
		crimeTypesResult.forEach(row => { crimeMap[row.CrimeSubHead.ROWID] = row.CrimeSubHead.CrimeHeadName; });

		const SEVERITY_WEIGHTS = {
			Murder: 10,
			Kidnapping: 9,
			Robbery: 8,
			'Drug Peddling': 8,
			Assault: 7,
			Burglary: 6,
			'Vehicle Theft': 5,
			'Cyber Fraud': 5,
			'Chain Snatching': 4,
			'Domestic Violence': 4,
			'Online Scam': 3,
			Theft: 3
		};

		const stationStats = {};

		casesResult.forEach(row => {
			const c = row.CaseMaster;
			const stationName = unitMap[c.PoliceStationID] || 'Unknown PS';
			const crime = crimeMap[c.CrimeSubHeadID] || 'Other';
			const weight = SEVERITY_WEIGHTS[crime] || 3;

			if (!stationStats[stationName]) {
				stationStats[stationName] = { station: stationName, totalCases: 0, weightedSum: 0, crimeBreakdown: {} };
			}

			stationStats[stationName].totalCases += 1;
			stationStats[stationName].weightedSum += weight;
			stationStats[stationName].crimeBreakdown[crime] = (stationStats[stationName].crimeBreakdown[crime] || 0) + 1;
		});

		const scores = Object.values(stationStats).map(s => {
			const rawScore = (s.weightedSum / (s.totalCases * 10)) * 100;
			const riskScore = Math.min(100, Math.round(rawScore + (s.totalCases * 1.5)));
			let level = 'Low Risk';
			if (riskScore >= 75) level = 'High Risk 🚨';
			else if (riskScore >= 50) level = 'Moderate Risk ⚠️';

			return {
				station: s.station,
				totalCases: s.totalCases,
				riskScore,
				level,
				topCrime: Object.entries(s.crimeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
			};
		}).sort((a, b) => b.riskScore - a.riskScore);

		res.status(200).json({ status: 'success', totalStationsEvaluated: scores.length, rankings: scores });
	} catch (error) {
		console.error('Risk scores error:', error);
		res.status(500).json({ status: 'error', message: error.message });
	}
});

module.exports = app;