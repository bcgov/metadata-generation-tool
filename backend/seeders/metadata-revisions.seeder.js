let db = require('../db/db');
const { Seeder } = require('mongoose-data-seed');

const data = [
  {
    create_date: new Date(),
    repo_branch_id: "5e7a5a4cd753d25b044b3d67",
    type: "tabular_data_package",
    revision_number: 1,
    change_summary: "Initial upload",
    updater: "Jane Doe",
    content: {}
  },
  {
    create_date: new Date(),
    repo_branch_id: "5e7a5a4cd753d25b044b3d67",
    type: "tabular_data_package",
    revision_number: 2,
    change_summary: "Added column",
    updater: "Jane Doe",
    content: {}
  },
  {
    create_date: new Date(),
    repo_branch_id: "5e7a5a4cd753d25b044b3d67",
    type: "tabular_data_package",
    revision_number: 3,
    change_summary: "Removed column, change column type",
    updater: "Jane Doe",
    content: {}
  },
  {
    create_date: new Date(),
    repo_branch_id: "5e7a5a4cd753d25b044b3d67",
    type: "tabular_data_package",
    revision_number: 4,
    change_summary: "Added columns, column constraints, removed columns",
    updater: "John Doe",
    content: {}
  },
  {
    create_date: new Date(),
    repo_branch_id : "5e7a5a4dd753d25b044b3d68",
    type : "tabular_data_package",
    revision_number : 1,
    change_summary : "Initial upload",
    updater : "John Doe",
    content : {}
  },
  {
    create_date: new Date(),
    repo_branch_id : "5e7a5a4dd753d25b044b3d68",
    type : "tabular_data_package",
    revision_number : 2,
    change_summary : "Removed column, change column type",
    updater : "Jane Doe",
    content : {}
  },
  {
    create_date: new Date(),
    repo_branch_id : "5e7a5a4dd753d25b044b3d69",
    type : "tabular_data_package",
    revision_number : 1,
    change_summary : "Initial upload",
    updater : "Jane Doe",
    content : {}
  },
  {
    create_date: new Date(),
    repo_branch_id : "5e7a5a4dd753d25b044b3d69",
    type : "tabular_data_package",
    revision_number : 2,
    change_summary : "Added column",
    updater : "Jane Doe",
    content : {}
  }
    
    
    
    
    
    
    

];

class MetadataRevisionsSeeder extends Seeder {

  async shouldRun() {
    const metadataRevisionSchema = db.MetadataRevisionSchema;
    const count = await metadataRevisionSchema.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const metadataRevisionSchema = db.MetadataRevisionSchema;
    return metadataRevisionSchema.create(data);
  }

}

module.exports = MetadataRevisionsSeeder;