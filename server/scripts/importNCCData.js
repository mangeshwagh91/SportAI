const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const NCCCadet = require('../src/models/NCCCadet');

const parseDate = (dateStr) => {
  if (!dateStr || dateStr === 'NO' || dateStr === 'No') return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const importCSV = async (csvFilePath) => {
  let connection;
  try {
    // Connect to database
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const cadets = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const cadet = {
              slNo: parseInt(row['SL NO']) || null,
              chNo: row['CH NO']?.toString().trim() || '', // Chest Number
              nccNo: row['NCC NO']?.trim() || '',
              rank: row['Rank']?.trim() || '',
              fullName: row['Full Name']?.trim() || '',
              directorate: row['Directorate']?.trim() || '',
              groupHQ: row['Group HQ']?.trim() || '',
              nccUnit: row['NCC Unit']?.trim() || '',
              dob: parseDate(row['DOB']),
              education: row['Education']?.trim() || '',
              specialAchievement: row['Special Achievement']?.trim() || '',
              schoolCollege: row['School/College']?.trim() || '',
              catTeaching: row['Cat. Teaching']?.trim() || '',
              mobile: row['Mobile']?.trim() || '',
              aadhaar: row['Aadhaar']?.trim() || '',
              food: row['Food']?.trim() || '',
              permTemp: row['Perm./Temp.']?.trim() || '',
              principal: row['Principal']?.trim() || '',
              coNameMobile: row['CO Name & Mobile']?.trim() || '',
              dc: row['DC']?.trim() || '',
              email: row['Email']?.trim() || '',
              dtOfSelect: parseDate(row['Dt Of Select']),
              movOrder: row['Mov. Order']?.trim() || '',
              nominalRoll: row['Nominal Roll']?.trim() || '',
              idemnityBond: row['Idemnity Bond']?.trim() || '',
              medExamCert: row['Med Exam Cert']?.trim() || '',
              riskCert: row['Risk Cert']?.trim() || '',
              formIII: row['Form-III']?.trim() || '',
              authentication: row['Authentication']?.trim() || '',
              matriculation: row['Matriculation']?.trim() || '',
              dcCert: row['DC Cert']?.trim() || '',
              drowningCert: row['Drowning Cert']?.trim() || '',
              medStatus: row['Med Status']?.trim() || '',
              wing: row['Wing']?.trim() || '',
              sdJdDiv: row['SD/JD Div']?.trim() || '',
              bloodGrp: row['Blood Grp']?.trim() || '',
              arrivalDate: parseDate(row['Arrival Date']),
              arrivalTime: row['Arrival Time']?.trim() || '',
              company: row['Company']?.trim() || '',
              clubActivity: row['Club Activity']?.trim() || '',
              project: row['Project']?.trim() || '',
              photo: row['Photo']?.trim() || '',
              dtOfComm: parseDate(row['Dt of Comm']),
              rtu: row['RTU']?.trim() || '',
              married: row['Married']?.trim() || '',
              nameOfNok: row['Name of Nok']?.trim() || '',
              relationWithNok: row['Relation with Nok']?.trim() || '',
              mobileOfNok: row['Mobile of Nok']?.trim() || '',
              addressOfNok: row['Address of Nok']?.trim() || '',
              nameOfEmg: row['Name of Emg']?.trim() || '',
              relationWithEmg: row['Relation with Emg']?.trim() || '',
              mobileOfEmg: row['Mobile of Emg']?.trim() || '',
              addressOfEmg: row['Address of Emg']?.trim() || '',
              doctor: row['Doctor']?.trim() || '',
              hospital: row['Hospital']?.trim() || '',
              image: row['Image']?.trim() || '',
              signedUp: false,
              userId: null
            };
            
            if (cadet.chNo) {
              cadets.push(cadet);
            }
          } catch (err) {
            console.error('Error parsing row:', err);
          }
        })
        .on('end', async () => {
          try {
            console.log(`Parsed ${cadets.length} cadets from CSV`);
            
            // Clear existing data (optional - comment out if you want to keep existing)
            await NCCCadet.deleteMany({});
            console.log('Cleared existing NCC cadet data');
            
            // Insert new data
            const result = await NCCCadet.insertMany(cadets, { ordered: false });
            console.log(`Imported ${result.length} NCC cadets successfully`);
            await mongoose.connection.close();
            console.log('Database connection closed');
            resolve(result);
          } catch (err) {
            await mongoose.connection.close();
            reject(err);
          }
        })
        .on('error', async (err) => {
          await mongoose.connection.close();
          reject(err);
        });
    });
  } catch (error) {
    console.error('Import error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    throw error
    console.log('Database connection closed');
  }
};

// Get CSV file path from command line argument or use default
const csvFilePath = process.argv[2] || path.join(__dirname, '../../RANA_PRATAP_COY_v2.csv');

if (!fs.existsSync(csvFilePath)) {
  console.error(`CSV file not found: ${csvFilePath}`);
  console.log('Usage: node importNCCData.js <path-to-csv-file>');
  process.exit(1);
}

console.log(`Importing data from: ${csvFilePath}`);

importCSV(csvFilePath)
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
