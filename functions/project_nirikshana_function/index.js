'use strict';
const catalyst = require('zcatalyst-sdk-node');
const express = require('express');
const app = express();
app.use(express.json());

// ---------- Reference data ----------
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

// A small set of names we deliberately reuse across multiple cases
// to create realistic-looking repeat offenders / network graph connections.
const REPEAT_OFFENDER_NAMES = [
	'Manjunath Gowda', 'Suresh Naik', 'Prakash Shetty', 'Ravi Kumar Reddy',
	'Naveen Patil', 'Ganesh Rao', 'Vinay Hegde'
];

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, decimals = 6) {
	return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function randomName() {
	return `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`;
}
function randomDateBetween(startYear, endYear) {
	const start = new Date(startYear, 0, 1).getTime();
	const end = new Date(endYear, 11, 31).getTime();
	return new Date(start + Math.random() * (end - start));
}
function toDateString(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function toDateTimeString(d) {
	return `${toDateString(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
}

// Insert rows in chunks so we never send too large a payload in one call
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

		// ---------- 1. Districts ----------
		const districtRows = DISTRICTS.map(d => ({ DistrictName: d.name, Active: true }));
		const insertedDistricts = await bulkInsertChunked(districtTable, districtRows);
		// Pair each inserted row (with its new ROWID) back to its lat/lng info
		const districtsWithIds = insertedDistricts.map((row, idx) => ({
			rowid: row.ROWID,
			name: DISTRICTS[idx].name,
			lat: DISTRICTS[idx].lat,
			lng: DISTRICTS[idx].lng
		}));

		// ---------- 2. Crime Sub Heads ----------
		const crimeRows = CRIME_TYPES.map(c => ({ CrimeHeadName: c.head, CrimeGroupName: c.group }));
		const insertedCrimes = await bulkInsertChunked(crimeSubHeadTable, crimeRows);
		const crimesWithIds = insertedCrimes.map((row, idx) => ({
			rowid: row.ROWID,
			head: CRIME_TYPES[idx].head
		}));

		// ---------- 3. Units (police stations) — 3 per district ----------
		const unitRows = [];
		const unitDistrictMap = []; // parallel array tracking which district each unit belongs to
		districtsWithIds.forEach(d => {
			for (let i = 1; i <= 3; i++) {
				unitRows.push({
					UnitName: `${d.name} PS-${i}`,
					DistrictID: d.rowid,
					Active: true
				});
				unitDistrictMap.push(d);
			}
		});
		const insertedUnits = await bulkInsertChunked(unitTable, unitRows);
		const unitsWithIds = insertedUnits.map((row, idx) => ({
			rowid: row.ROWID,
			district: unitDistrictMap[idx]
		}));

		// ---------- 4. CaseMaster — 800 records ----------
		const TOTAL_CASES = 800;
		const caseRows = [];
		for (let i = 0; i < TOTAL_CASES; i++) {
			const unit = randomChoice(unitsWithIds);
			const crime = randomChoice(crimesWithIds);
			const incidentDate = randomDateBetween(2025, 2026);

			// Jitter lat/lng around the district center so pins cluster realistically
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

		// Deliberately inject a visible spike: extra Theft cases in one district/month
		// for the anomaly-detection demo to have something real to catch.
		const spikeDistrict = districtsWithIds[0];
		const spikeUnit = unitsWithIds.find(u => u.district.rowid === spikeDistrict.rowid);
		const theftCrime = crimesWithIds.find(c => c.head === 'Theft') || crimesWithIds[0];
		for (let i = 0; i < 25; i++) {
			const d = new Date(2026, 5, randomInt(1, 28)); // June 2026 spike
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

		// ---------- 5. Accused — ~350 records, with repeat offenders woven in ----------
		const accusedRows = [];
		const TOTAL_ACCUSED = 350;
		for (let i = 0; i < TOTAL_ACCUSED; i++) {
			const caseRow = randomChoice(insertedCases);
			// ~20% chance to use one of our deliberate repeat-offender names
			const useRepeat = Math.random() < 0.2;
			const name = useRepeat ? randomChoice(REPEAT_OFFENDER_NAMES) : randomName();

			accusedRows.push({
				CaseMasterID: caseRow.ROWID,
				AccusedName: name,
				AgeYear: randomInt(18, 55),
				GenderID: randomChoice(GENDERS)
			});
		}
		// Make sure each repeat-offender name appears at least 3 times across different cases
		REPEAT_OFFENDER_NAMES.forEach(name => {
			for (let i = 0; i < 3; i++) {
				const caseRow = randomChoice(insertedCases);
				accusedRows.push({
					CaseMasterID: caseRow.ROWID,
					AccusedName: name,
					AgeYear: randomInt(25, 45),
					GenderID: 'M'
				});
			}
		});

		await bulkInsertChunked(accusedTable, accusedRows);

		res.status(200).json({
			status: 'success',
			districts: insertedDistricts.length,
			crimeTypes: insertedCrimes.length,
			units: insertedUnits.length,
			cases: insertedCases.length,
			accused: accusedRows.length
		});
	} catch (error) {
		console.error('Seeding error:', error);
		res.status(500).json({ status: 'error', message: error.message, stack: error.stack });
	}
});

module.exports = app;