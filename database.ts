/**
 * Database Configuration for HealSmart Hospital Management System
 * Oracle Database Connection Settings
 */

export const dbConfig = {
  user: 'project332',
  password: '1234',
  connectString: 'localhost/XEPDB1',
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 2,
};

export default dbConfig;
