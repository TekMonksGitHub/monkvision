/* 
 * (C) 2015 TekMonks. All rights reserved.
 * See enclosed LICENSE file.
 */
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3");
let usersDB;

exports.getUserHash = data => {
	return new Promise((resolve, reject) => bcrypt.hash(data, APP_CONSTANTS.SALT_PW, (err, hash) => {
		if (err) reject("BCRYPT internal error."); else {
			// URL encoding removes characters which are illegal for paths, like "\" or "/" etc.
			let encoded_hash = encodeURIComponent(hash);

			// On Windows directory names can't end with the . character. So replace it with %2E
			// which is its URL encoded notation, if that's the case.
			if (encoded_hash.substr(-1) == '.')
				encoded_hash = encoded_hash.substring(0, encoded_hash.length - 1) + '%2E';
			
			resolve(encoded_hash);		
		}
	}));
}

exports.register = (id, name, org, pwph, totpSecret) => {
	return new Promise(async (resolve, _reject) => {
		const exists = await exports.exists(pwph);
		if (exists.result) {resolve({result:false}); return;}
		const existsID = await exports.existsID(id);
		if (existsID.result) {resolve({result:false}); return;}
		pwph = await exports.getUserHash(pwph);
		usersDB.run(`INSERT INTO users(id, name, org, pwph, totpsec) VALUES (?,?,?,?,?)`, 
			[id,name,org,pwph,totpSecret], err => err ? resolve({result: false}) : resolve({result: true}));
	});
}

exports.exists = exports.login = pwph => {
	return new Promise((resolve, _reject) => {
		initDB()
		.then(_ => exports.getUserHash(pwph))
		.then(pwph => {
			usersDB.all(`SELECT id, name, org, totpsec FROM users WHERE pwph = ? COLLATE NOCASE;`, [pwph], (err, rows) => {
				if (err || !rows.length) resolve({result: false});
				else resolve({result: true, name: rows[0].name, org: rows[0].org, id: rows[0].id, totpsec: rows[0].totpsec});
			})
		})
		.catch(_ => resolve({result: false}));
	});
}

exports.existsID = id => {
	return new Promise(async (resolve, _reject) => {
		await initDB();
		usersDB.all(`SELECT id, name, org, totpsec FROM users WHERE id = ? COLLATE NOCASE;`, [id], (err, rows) => {
			if (err || !rows.length) resolve({result: false});
			else resolve({result: true, name: rows[0].name, org: rows[0].org, id: rows[0].id, totpsec: rows[0].totpsec});
		});
	});
}

exports.changepwph = (id, pwph) => {
	return new Promise((resolve, _reject) => {
		initDB()
		.then(_ => exports.getUserHash(pwph))
		.then(pwph => {
			usersDB.all(`UPDATE users SET pwph = ? WHERE id = ?;`, [pwph,id], err => {
				if (err) resolve({result: false});
				else resolve({result: true});
			})
		})
		.catch(_ => resolve({result: false}));
	});
}

function initDB() {
	return new Promise((resolve, reject) => {
		if (!usersDB) usersDB = new sqlite3.Database(APP_CONSTANTS.APP_DB, sqlite3.OPEN_READWRITE, err => {
			if (!err) resolve(); else reject(err);
		}); else resolve();
	});
}
