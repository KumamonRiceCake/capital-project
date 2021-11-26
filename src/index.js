const express = require('express');
require('./db/mongoose');
const Project = require('./models/project');
const data = require('./AI Dataset.json');

const app = express();

//read data from dataset json file
app.get('/read', async (req, res) => {
    try {
        for (let i=0; i<data.length; i++) {
            const proj = data[i];

            let d1 = new Date(proj['Project Phase Actual Start Date']);
            if (d1.toString() == 'Invalid Date') { proj['Project Phase Actual Start Date'] = null; }

            let d2 = new Date(proj['Project Phase Planned End Date']);
            if (d2.toString() == 'Invalid Date') { proj['Project Phase Planned End Date'] = null; }

            let d3 = new Date(proj['Project Phase Actual End Date']);
            if (d3.toString() == 'Invalid Date') { proj['Project Phase Actual End Date'] = null; }

            let n1 = parseInt(proj['Project Geographic District']);
            let n2 = parseInt(proj['Project Budget Amount']);
            let n3 = parseInt(proj['Final Estimate of Actual Costs Through End of Phase Amount']);
            let n4 = parseInt(proj['Total Phase Actual Spending Amount']);

            if (typeof(n1) !== Number) { proj['Project Geographic District'] = null; }
            else { proj['Project Geographic District'] = n1; }

            if (typeof(n2) !== Number) { proj['Project Budget Amount'] = null; }
            else { proj['Project Budget Amount'] = n2; }

            if (typeof(n3) !== Number) { proj['Final Estimate of Actual Costs Through End of Phase Amount'] = null; }
            else { proj['Final Estimate of Actual Costs Through End of Phase Amount'] = n3; }

            if (typeof(n4) !== Number) { proj['Total Phase Actual Spending Amount'] = null; }
            else { proj['Total Phase Actual Spending Amount'] = n4; }

            const project = new Project({
                'Project Geographic District': proj['Project Geographic District'],
                'Project Building Identifier': proj['Project Building Identifier'],
                'Project School Name': proj['Project School Name'],
                'Project Type': proj['Project Type'],
                'Project Description': proj['Project Description'],
                'Project Phase Name': proj['Project Phase Name'],
                'Project Status Name': proj['Project Status Name'],
                'Project Phase Actual Start Date': proj['Project Phase Actual Start Date'],
                'Project Phase Planned End Date': proj['Project Phase Planned End Date'],
                'Project Phase Actual End Date': proj['Project Phase Actual End Date'],
                'Project Budget Amount': proj['Project Budget Amount'],
                'Final Estimate of Actual Costs Through End of Phase Amount': proj['Final Estimate of Actual Costs Through End of Phase Amount'],
                'Total Phase Actual Spending Amount': proj['Total Phase Actual Spending Amount'],
                'DSF Number(s)': proj['DSF Number(s)']
            });

            await project.save();
        }
        
        res.send();
    } catch (e) {
        res.status(400).send(e);
    }
});

// Search "Project School Name” and “Project Description”
// Pagination: limit, skip (required fields)
app.get('/search', async (req, res) => {
    const school = req.query.school;
    const description = req.query.description;

    if (!school && !description) {
        return res.status(400).send({ error: "Please provide school name or description!" });
    }

    try {
        const projs = await Project.find({
            'Project School Name': school,
            'Project Description': description
        }).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip));

        res.send(projs);
    } catch (e) {
        res.status(400).send(e);
    }
});


// Filters: Project Phase Actual End Date is between given start date and end date
// Pagination: limit, skip (required fields)
app.get('/search/date', async (req, res) => {
    let start = new Date(req.query.start);
    let end = new Date(req.query.end);

    console.log(start, end)

    if (!start || !end) {
        return res.status(400).send({ error: "Please provide start & end dates!" });
    }

    try {
        const projs = await Project.find({
            'Project Phase Actual End Date': {
                $gte: start, 
                $lt: end
            }
        }).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip));

        res.send(projs);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Filters: budget <= Project Budget Amount
// Pagination: limit, skip (required fields)
app.get('/search/budget', async (req, res) => {
  const budget = parseInt(req.query.budget);

  if (budget === undefined) {
      return res.status(400).send({ error: "Please provide maximum budget!" });
  }

  try {
      const projs = await Project.find({
          'Final Estimate of Actual Costs Through End of Phase Amount': { $gte: budget }
      }).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip));

      res.send(projs);
  } catch (e) {
      res.status(400).send(e);
  }
});

//Update API on individual projects to update [Project Phase Actual Start Date, Total Phase Actual Spending Amount]
app.patch('/project/:id', async (req, res) => {
    let startDate = req.query.start;
    const amount = req.query.amount;

    if (!startDate || !amount) {
        return res.status(400).send({ error: "Please provide project phase actual start date or total phase actual spending amount!" });
    }

    startDate = new Date(startDate);
    if (startDate.toString() == 'Invalid Date') {
        return res.status(400).send({ error: "Please provide valid project phase actual start date!" });
    }

    try {
        const proj = await Project.findOne({ _id: req.params.id });
        if (!proj) { return res.status(404).send(); }

        if (startDate) { proj['Project Phase Actual Start Date'] = startDate; }
        if (amount) { proj['Total Phase Actual Spending Amount'] = amount; }
        
        await proj.save();
        res.send(proj);
    } catch (e) {
        res.status(400).send(e);
    }
})

// Listen on port 3000
const listener = app.listen(3000, function () {
    console.log('Listening on port ' + listener.address().port);
});
