// Endpoint for the JSON dataset
const URL = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";
// Top N results to be displayed in the plots (TOP)
const TOP = 10;

// Variables that will keep the information extracted from the JSON
var names = [];
var metadata = [];
var samples = [];

function init() {
  // Loading the JSON Samples data
  d3.json(URL).then((data) => {
    // Load the different options into the dropdown element "selDataset"
    var selDataset = d3.select("#selDataset");
    names = data.names;
    metadata = data.metadata;
    samples = data.samples;

    // Adding the subject ID name to the dropdown element "#selDataset"
    names.forEach((name) => {
      selDataset.append("option")
                .text(name)
                .property("value", name);
    });  

    setSubjectIdTitle(names[0]);
    getDemographicInfo(names[0]);
    prepareCharts(names[0]);
  });
}

function setSubjectIdTitle(id) {
  var subjectIdTitle = d3.select("#subject-id-title");
  // Initially, clear any existing metadata in the div panel element "subject-id-title"
  subjectIdTitle.html("");
  subjectIdTitle.append("h2").text(`Information for Subject ID ${id}`);
}

// Function to display each key-value pair from the metadata JSON object.
function getDemographicInfo(id) {
  // Reference to the div panel element "sample-metadata" to load the Demographic Information
  var sampleMetadata = d3.select("#sample-metadata");
  // Initially, clear any existing metadata in the div panel element "sample-metadata"
  sampleMetadata.html("");

  // Filtering to fetch the required data from the metadata array of JSON object
  var resultArray = metadata.filter(sampleObj => sampleObj.id == id);

  // The filter should result in an array with only 1 element
  if (resultArray.length > 0) {
    var result = resultArray[0];
    
    // Using "Object.entries" to add each key-value pair to the div panel
    Object.entries(result).forEach(([key, value]) => {
      sampleMetadata.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
  }
}

// Function that prepares and loads all 3 different plots that ara available in this page:
// 1) Fetch for the data for the captioned Sample ID
// 2) Prepare Bar Chart, runing the slice of N samples and reversing
// 3) Prepare the Bubble Chart, setting up the size of the bubble according to the number of samples
// 4) Prepare the Gauge Chart, fetching the number of Washing Frequency from the Metadata array.
function prepareCharts(id) {
  
  // Filtering to fetch the required data from the samples array of JSON object
  var resultArray = samples.filter(sampleObj => sampleObj.id == id);

  // The filter should result in an array with only 1 element
  if (resultArray.length > 0) {
    var result = resultArray[0];

    // Creating the variables to populate the plots (sample_values, otu_ids, otu_labels)
    var sample_values = result.sample_values;
    var otu_ids = result.otu_ids;
    var otu_labels = result.otu_labels;

    // *** BAR CHART ***

    // Creating the Bar Chart Trace variable for the plot
    var traceBarChart = [{
      type : "bar",
      orientation : "h",
      x : sample_values.slice(0, TOP).reverse(), // Getting the top N samples and reversing
      y : otu_ids.slice(0, TOP).map(ids => `OTU ${ids}`).reverse(), // Getting the top N OTU_IDs and reversing
      text : otu_labels.slice(0, TOP).reverse()
    }];

    // Creating the Layout for the Bar Chart. 
    var traceBarLayout = {
      title : `Top ${TOP} OTUs`
    };
    
    // Ploting the Bar Chart
    Plotly.newPlot("bar", traceBarChart, traceBarLayout);

    // *** BUBBLE CHART ***

    // Creating Bubble Chart Trace variable for the plot
    var traceBubbleChart = [{
      mode : "markers",
      x : otu_ids,
      y : sample_values,
      text : otu_labels,
      marker: {
        size : sample_values,
        color : otu_ids,
        colorscale: "Earth"
      }
    }];

    // Creating the Layout for the Bubble Chart. 
    var traceBubbleLayout = {
      xaxis : {title:"OTU ID"},
    };

    // Ploting the Bubble Chart
    Plotly.newPlot("bubble", traceBubbleChart, traceBubbleLayout); 

    // *** GAUGE CHART ***

    var wfreq = 0;
    // Filtering the Metadata to get the Washing Frequency for the given ID
    var resultMetadataArray = metadata.filter(sampleObj => sampleObj.id == id);
    // The filter should result in an array with only 1 element
    if (resultMetadataArray.length > 0) {
      wfreq = resultMetadataArray[0].wfreq;
    }
    
    // Creating Gauge Chart Trace variable for the plot
    var traceGaugeChart = [{
      domain: { x: [0, 1], y: [0, 1] },
      value: wfreq,
      title: {text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week"},
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: { range: [null, 9], tickwidth: 2 },
        bar: {color: '#0e5d0e'},
        steps: [
          {range: [0,1], color: '#f6fef6'},
          {range: [1,2], color: '#d4f8d4'},
          {range: [2,3], color: '#b2f3b2'},
          {range: [3,4], color: '#90ee90'},
          {range: [4,5], color: '#6ee96e'},
          {range: [5,6], color: '#4ce44c'},
          {range: [6,7], color: '#2ade2a'},
          {range: [7,8], color: '#1ec31e'},
          {range: [8,9], color: '#19a119'},
          {range: [9,10], color: '#137f13'}
        ]
      }

    }];
    
    // Creating the Layout for the Gauge Chart. 
    var traceGaugeLayout = { margin: { t: 0, b: 0 } };
    
    // Ploting the Gauge Chart
    Plotly.newPlot('gauge', traceGaugeChart, traceGaugeLayout);
  }
}

// Function that triggers the different internal functions to refresh the information in the page
// This is based on the captioned ID from the selected option
function optionChanged(id) {
  setSubjectIdTitle(id);
  getDemographicInfo(id);
  prepareCharts(id);
}

init();