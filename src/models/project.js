const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    'Project Geographic District': { type: Number },
    'Project Building Identifier': { type: String },
    'Project School Name': { type: String },
    'Project Type': { type: String },
    'Project Description': { type: String },
    'Project Phase Name': { type: String },
    'Project Status Name': { type: String },
    'Project Phase Actual Start Date': { type: Date },
    'Project Phase Planned End Date': { type: Date },
    'Project Phase Actual End Date': { type: Date },
    'Project Budget Amount': { type: Number },
    'Final Estimate of Actual Costs Through End of Phase Amount': { type: Number },
    'Total Phase Actual Spending Amount': { type: Number },
    'DSF Number(s)': { type: String }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;