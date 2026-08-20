// Run once after connecting to your database:  node seed.js
// Loads the Brand / Model / FG Code master list you provided.
require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('./src/models/Brand');
const Model = require('./src/models/Model');

const rows = [
["CG","CG12HP05C","SO00123H2585KE"],["CG","CG18HP05C","SO00183H2589KE"],
["CG MERIDIA","CGM12HP06C","SO00123H2589KE"],["CG MERIDIA","CGM18HP06C","SO00183H2585KE"],
["Linken","LS0152501","SO0183F2550KD"],
["Innovax","9K-IAC009KS","SO0090F2590KE"],["Innovax","12K-IAC012KS","SO0090F2590KE"],
["Innovax","12K-IAC012KIN","SO0090F2590KE"],["Innovax","9K-IAC009KIN","SO0090F2590KE"],
["Panasonic","CU-RU12CKY","CU-RU12CKY"],["Panasonic","CU-RU18CKY","CU-RU18CKY"],
["Panasonic","CU-RU18CKY-1","CU-RU18CKY-1"],["Panasonic","CU-SU18BKY3T","CU-SU18BKY3T"],
["Panasonic","CU-KN12CKY","CU-KN12CKY"],["Panasonic","CU-SU12BKY3W","CU-SU12BKY3W"],
["Panasonic","CU-SU12BKY3T","CU-SU12BKY3T"],["Panasonic","CU-KN18CKY","CU-KN18CKY"],
["Panasonic","CU-KN24CKY","CU-KN24CKY"],["Panasonic","CU-SU18BKY3W","CU-SU18BKY3W"],
["Panasonic","CU-SU18BKY3WXH","CU-SU18BKY3WXH"],["Panasonic","CU-NU18BKY5WX","CU-NU18BKY5WX"],
["Panasonic","CU-NU18BKY4WX","CU-NU18BKY4WX"],["Panasonic","CU-NU18BKY5WXH","CU-NU18BKY5WXH"],
["Panasonic","CU-NU12BKY4W","CU-NU12BKY4W"],["Panasonic","CU-NU12BKY5W","CU-NU12BKY5W"],
["Panasonic","CU-RU24CKY","CU-RU24CKY"],
["Croma","CRLA012INF170291","SO0125I2627KD"],["Croma","CRLA018IND170292","SO0183I2627KD01"],
["Croma","CRLA018IND170297","SO0183I2627KD02"],["Croma","CRLA012INF170296","SO0125I2627KD02"],
["Croma","CRLA022IND170294","SO0223I2627KD"],
["TCL","TAC-12CSD/EV3AM","SO0123I2682KD"],["TCL","TAC-22CSD/EV3AM","SO0223I2682KD"],
["TCL","18AMEV3","SO0183I2682KD04"],["TCL","TAC-12CSD/EV5AM","SO0125I2682KD"],
["TCL","AR18EV3","SO0183I2682KD03"],["TCL","TAC-18CSD/EV3AR","SO0183I2682KD01"],
["TCL","TAC-18CSD/EV5AM","SO0185I2682KD"],["TCL","18AMEV5","SO0185I2682KD02"],
["Mitsubishi Electric","MUY-AMZ13VF-DA1","MUY-AMZ13VF-DA1-KT"],
["Mitsubishi Electric","MUY-AMZ18VF-DA1","MUY-AMZ18VF-DA1-KT"],
["Mitsubishi Electric","MUY-AMZ22VF-DA1","MUY-AMZ22VF-DA1-KT"],
["Mitsubishi Electric","MU-AGZ19VF-DA2-KT","MU-AGZ19VF-DA2-KT"],
["Mitsubishi Electric","MUY-AMZ24VF-DA1-KT","MUY-AMZ24VF-DA1-KT"],
["Mitsubishi Heavy","SRC18YAMDA-W","SRC18YAMDA-W"],["Mitsubishi Heavy","SRC18CAPDA-W","SRC18CAPDA-W"],
["Mitsubishi Heavy","SRC25CAPDA-W","SRC25CAPDA-W"],["Mitsubishi Heavy","SRC13YAMDA-W","SRC13YAMDA-W"],
["Mitsubishi Heavy","SRC21YAMDA-W","SRC21YAMDA-W"],["Mitsubishi Heavy","SRC20CAPDA-W","SRC20CAPDA-W"],
["Mitsubishi Heavy","DXC15CAPDA-W","DXC15CAPDA-W"],["Mitsubishi Heavy","DXC18YAMDA-W","DXC18YAMDA-W"],
["Mitsubishi Heavy","DXC13YAMDA-W","DXC13YAMDA-W"],["Mitsubishi Heavy","DXC18CAPDA-W","DXC18CAPDA-W"],
["Mitsubishi Heavy","DXC21YAMDA-W","DXC21YAMDA-W"],["Mitsubishi Heavy","DXC25CAPDA-W","DXC25CAPDA-W"],
["Mitsubishi Heavy","DXC20CAPDA-W","DXC20CAPDA-W"],["Mitsubishi Heavy","SRC15CAPDA-W","SRC15CAPDA-W"],
["Mitsubishi Heavy","SRC27YAMDA-W","SRC27YAMDA-W"],["Mitsubishi Heavy","DXC27YAMDA-W","DXC27YAMDA-W"],
["Toshiba","RAS-18Y5ACV3CGB-IN","SO0183I2642KD01"],["Toshiba","RAS-18Y5ACV3CGB-IT","SO0183I2642KD"],
["Toshiba","RAS-13Y5ACV3CGB-IN","SO0123I2642KD01"],["Toshiba","RAS-13Y5ACV3CGB-IT","SO0123I2642KD"],
["Toshiba","RAS-24Y5ACV3CGB-IN","SO0243I2642KD01"],["Toshiba","RAS-24Y5ACV3CGB-IT","SO0243I2642KD"],
["Toshiba","RAS-13Y5ACV5CGB-IN","SO0125I2642KD01"],["Toshiba","RAS-13Y5ACV5CGB-IT","SO0125I2642KD"],
["Toshiba","RAS-18Y5ACV5CGB-IN","SO0185I2642KD01"],["Toshiba","RAS-18Y5ACV5CGB-IT","SO0185I2642KD"],
["Toshiba","RAS-30Y5ACV3CGB-IN","SO0303I2642KD01"],["Toshiba","RAS-30Y5ACV3CGB-IT","SO0303I2642KD"],
["Cruise","CWCVBM-VQ3D173","SO0183I2617KD01"],["Cruise","CWCVBM-VQ3S173","SO0183I2617KD"],
["Cruise","CWCVBM-VQ1D243","SO0223I2617KD02"],["Cruise","CWCVBM-VQ1F243","SO0223I2617KD"],
["Cruise","CWCVBM-VQ1D185","SO0185I2617KD02"],["Cruise","CWCVBM-VP3F185","SO0185I2617KD"],
["Cruise","CWCVBM-VQ1F123","SO0123I2617KD01"],["Cruise","CWCVBM-VQ1D123","SO0123I2617KD"],
["Cruise","CWCVBM-VP3F185BL","SO0185I2617KD01"],["Cruise","CWCVBM-VQ1F243BL","SO0223I2617KD01"],
["Cruise","CWCVBM-VP3F193BL","SO0183I2617KD05"],
["Realme","163IAA26WRMS","SO0183I2656KD"],["Realme","123IAA26WRMS","SO00143I2622KD"],
["Realme","155IAA26WRMS","SO0185I2622KD"],["Realme","203IAA26WRMS","SO0223I2656KD"],
["Realme","153IAA26WRMS","SO0183I2622KD"],["Realme","103IAA26WRMS","SO0113I2656"],
["Anchor","CU-AU18S3AAC","CU-AU18S3AAC"],["Anchor","CU-AU12S3AAC","CU-AU12S3AAC"],
["Anchor","CU-AU24S3AAC","CU-AU24S3AAC"],["Anchor","CU-AU18S5AAC","CU-AU18S5AAC"],
["Intec","IS3GR18INV","SO0183I2677KD"],
["ONEIRIC","ONC243INA6","SO0223I2647KD"],["ONEIRIC","ONEIRIC123IA6","SO0123I2647KD"],
["ONEIRIC","ONC125INA6","SO0125I2647KD"],["ONEIRIC","ONC183INA6","SO0143I2647KD"],
["ONEIRIC","ONEIRIC183IA6","SO0183I2647KD"],["ONEIRIC","ONC185INA6","SO0145I2647KD"],
["ONEIRIC","ONEIRIC182A2","SO0182F2647KD"],
["Panasonic","CU-KN12CKY3X","CU-KN12CKY3X"],["Panasonic","CU-KN18CKY3X","CU-KN18CKY3X"],
["Croma","CRLAS18IND170211","SO0183I2627KD06"],
["AKABISHI","RBY-HE18VG-AB1","RBY-HE18VG-AB1"],["AKABISHI","RBY-HE18VG-AB1-KT","RBY-HE18VG-AB1-KT"],
["AKABISHI","RBY-HE22VG-AB1","RBY-HE22VG-AB1"],["AKABISHI","RBY-HE13VG-AB1-KT","RBY-HE13VG-AB1-KT"],
["AKABISHI","RBY-HE13VG-AB1","RBY-HE13VG-AB1"],
["O General","AOGG24CKWA-B","AOGG24CKWA-B"],["O General","AOGG24CPWA-B","AOGG24CPWA-B"],
["O General","AOGG22CNWA-B","AOGG22CNWA-B"],["O General","AOGA14NMWA-B(H&C)","AOGA14NMWA-B"],
["O General","AOGA18NMWA-B(H&C)","AOGA18NMWA-B"],
["NAPOLEON / Meet","NAP18/MR18E","SO0183I2658KD"],["NAPOLEON / Meet","NAP24/MR24E","SO0223I2658KD"],
["Napoleon","NAP24Z74/MM22","SO0222F2658KD"],
["Yasuda","YS-AC12AIT(H&C)","SO0123I26101KE"],["Yasuda","YS-AC18AIT(H&C)","SO0183I26101KE"],
["Yasuda","YS-AC24AIT(H&C)","SO0243I26101KE"],
["Sun mobility","ONC153IA6","2040211504"],["Sun mobility","ONC153IHA6","2040211562"],
["Chilton","AC183VSG","SO0183I2666KD"],
["Akaritek","AK-AC18EIT","SO00182A26102KE"],["Akaritek","AK-AC24EIT","SO00243A26102KE"],
["Akaritek","AK-AC12EIT","SO00123A26102KE"]
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding master data...');

  const brandCache = {};
  let modelCount = 0;

  for (const [brandName, modelName, fgCode] of rows) {
    if (!brandCache[brandName]) {
      let brand = await Brand.findOne({ name: brandName });
      if (!brand) brand = await Brand.create({ name: brandName });
      brandCache[brandName] = brand._id;
    }
    const exists = await Model.findOne({ brand: brandCache[brandName], modelName });
    if (!exists) {
      await Model.create({ brand: brandCache[brandName], modelName, fgCode });
      modelCount++;
    }
  }

  console.log(`Done. ${Object.keys(brandCache).length} brands, ${modelCount} new models inserted.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
