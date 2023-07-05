var param = {}
location.search.substr(1).split("&").forEach(
    function(item){
        param[item.split("=")[0]] = item.split("=")[1];
    }
);

console.log(param);

var repd = new Date();
repd = repd.setDate(repd.getDate() - 1);
repd = new Date(repd);
repd = repd.getUTCFullYear() + ("0" + (repd.getUTCMonth() + 1)).slice(-2);

var datafile = 'https://dmaster-d25.staging-cyberlibris.com/data/dashboardpub/statspub_' + param.name + '_' + repd + '.json';
//var keyratiofile = 'data/' + repd + '/stats_' + param.ref + '_' + repd + '.json';
console.log(datafile); 



d3.json(datafile).then(function(values){ready(values)});
//d3.json(keyratiofile).then(function(values){setupkr(values)});

var margin = {top: 20, right: 20, bottom: 50, left: 50};
var rdot = 5;
var legendrectsize = 15;
var timeParse = d3.utcParse("%Y%m");
var timeFormatMonth = d3.timeFormat("%b"); //m (00-12)
var timeFormatYear = d3.timeFormat("%Y");
var yseriescolor = d3.scaleOrdinal(d3.schemeCategory10);
var chartsid = ['leftchart1', 'leftchart3', 'rightchart2']; //'leftchart2',
var centralbuttontitle = {top_docid: 'TOP', bottom_docid: 'BOTTOM'};
var toporbottom = 'top_docid';
var whichseries = 'loads';
var selectedfct = 2;
var lang = 'fr';

var platformurl = 'http://' + param.ref + '.com/catalog/book/';
var imgurl = 'http://static.cyberlibris.fr/books_upload/300pix/';

// Manually set the series' names (used in the legend)
inityseriesname = {};

inityseriesname.leftchart1 = [
	{name : 'uniquedocid', label : 'Livres uniques consultés'},
	{name : 'loads', label : 'Livres consultés'},
	{name : 'folders', label : 'Livres ajoutés'} 
];
inityseriesname.leftchart2 = [
	{name : 'pageprints', label : 'Pages imprimées'}, 
	{name : 'pageviews', label : 'Pages consultées'}
];
inityseriesname.leftchart3 = [
	{name : 'uniqueiid', label : 'Institutions distinctes actives'}
];
inityseriesname.rightchart2 = [
	{name : 'bookloads', label : 'Livres consultés'},
	{name : 'bookfolders', label : 'Livre ajouté'}//,
	//{name : 'bookpageviews', label : 'Pages vues'},
	//{name : 'bookpageprints', label : 'Pages imprimées'}
];
// Create object which will contain arrays of visible series
yseriesname = {};

// Make an object with all series' names for easy use 
allseriesnames = {};
d3.keys(inityseriesname).map(function(d){
	inityseriesname[d].map(function(e){
		allseriesnames[e.name] = e.label;
	});
});

// LINE
var valueline = d3.line()
	.curve(d3.curveCatmullRom)
	.x(function(d) { return xscale(d.x); })
	.y(function(d) { return yscale(d.y); });

function ready(stats) {
	datastats = stats;
	console.log(datastats);

	// ROLES = FUNCTIONS
	iididname = {};
	datastats.institutions.iid.map(function(d, i){
		iididname[datastats.institutions.visual_name[i]] = d;
	});
	console.log(iididname);

	//COVERS
	docidcoversimg = {};
	datastats.covers.docid.map(function(d, i){
		docidcoversimg[d] = datastats.covers.coverimg[i];
	});

	// LIST OF SCHOOL NAMES
	d3
		.select('#functionlist')
		.selectAll('option')
		.data(['All'].concat(stats.institutions.visual_name.filter(function(e){ return e != 'All' })))
		.enter()
		.append('option')
		.attr('value', function(d){ return d; })
		.text(function(d){ return d; })

	d3
		.select('#functionlist')
		.on('change', function(d){
			selectedfct = iididname[d3.select('#functionlist').node().value];
			whichseries = 'loads';
			
			toporbottom = 'top_docid';
			d3.select('#centraltitle').text(centralbuttontitle[toporbottom]);

			d3.select('#centralsubtitle').text(allseriesnames[whichseries]);

			datefct = selectedfct;
			var temp = stats[toporbottom][datefct];
			(temp == undefined) ? updatecovers([]) : updatecovers(temp[whichseries]);

			chartsid.map(function(e){
				var whichpane = (e.substr(0,4) == 'left') ? 'leftpane' : 'rightpane';
				update(e, (whichpane == 'rightpane') ? docid : null);
			});
		});
	
	selectedfct = iididname[d3.select('#functionlist').node().value];

	chartsid.map(function(d){
		createsvgandg(d);
	});

	datefct = selectedfct;
	
	d3.select('#centralsubtitle').text(allseriesnames[whichseries]);
	updatecovers(datastats[toporbottom][datefct][whichseries]);
};

function setupkr(kr){
	console.log(kr);
	
	d3.selectAll('.refplatforme').text(param.ref);

	let iid = (cidoriid == 'cid') ? -9 : Number(param[cidoriid]);
	
	let krpagecompte = kr.meankrcompte.krpages[kr.meankrcompte.iid.indexOf(iid)];
	let krpageip = kr.meankrip.krpages[kr.meankrip.iid.indexOf(iid)];
	let krlivrecompte = kr.meankrcompte.krbooks[kr.meankrcompte.iid.indexOf(iid)];
	let krlivreip = kr.meankrip.krbooks[kr.meankrip.iid.indexOf(iid)];
	// KEY RATIOS
	d3.select('#krpagecompte').text(function(){ return Math.round((typeof krpagecompte != 'undefined') ? krpagecompte : 0); });
	d3.select('#krpageip').text(function(){ return Math.round((typeof krpageip != 'undefined') ? krpageip : 0); });
	d3.select('#krlivrecompte').text(function(){ return Math.round((typeof krlivrecompte != 'undefined') ? krlivrecompte : 0); });
	d3.select('#krlivreip').text(function(){ return Math.round((typeof krlivreip != 'undefined') ? krlivreip : 0); });

	let propcompte = kr.meankrprop.krpropcomptes[kr.meankrprop.iid.indexOf(iid)];
	let propip = kr.meankrprop.krpropip[kr.meankrprop.iid.indexOf(iid)];
	//PROP
	d3.select('#propcompte').text(function(d){ return Math.round((typeof propcompte != 'undefined') ? (propcompte * 10) : 0)/10; });
	d3.select('#propip').text(function(d){ return Math.round((typeof propip != 'undefined') ? (propip * 10) : 0)/10; });

	let meanpage = kr.means.pageviews[kr.means.iid.indexOf(iid)];
	let meanlivre = kr.means.books[kr.means.iid.indexOf(iid)];
	// MOYENNES
	d3.select('#meanpage').text(function(d){ return Math.round((typeof meanpage != 'undefined') ? meanpage : 0); });
	d3.select('#meanlivre').text(function(d){ return Math.round((typeof meanlivre != 'undefined') ? meanlivre : 0); });

	// REFERENCES
	d3.select('#refpagecompte').text(function(d){ return Math.round(kr.krrefcomptes.krpages[0]); });
	d3.select('#refpageip').text(function(d){ return Math.round(kr.krrefip.krpages[0]); });
	d3.select('#reflivrecompte').text(function(d){ return Math.round(kr.krrefcomptes.krbooks[0]); });
	d3.select('#reflivreip').text(function(d){ return Math.round(kr.krrefip.krbooks[0]); });
};

function createsvgandg(id_of_the_chart){
	yseriesname[id_of_the_chart] = [];
	inityseriesname[id_of_the_chart].map(function(d){ return yseriesname[id_of_the_chart].push(d.name); });

// Create SVG
	svgchart = d3
		.select('#' + id_of_the_chart)
		.select('#svgcontent' + id_of_the_chart)
		.append('svg')
		.attr('id', 'svg' + id_of_the_chart)
		.attr("width", '100%') //width + margin.left + margin.right
		.attr("height", '100%') //height + margin.top + margin.bottom
		.attr('overflow', 'inherit');

// Create g elements
	var gcontainerchart = svgchart
		.append('g')
		.attr('id', 'gcontainer')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	gcontainerchart
		.append('g')
		.attr('id', 'gaxis');

	gcontainerchart
		.append('g')
		.attr('id', 'gseries');

	gcontainerchart
		.append('g')
		.attr('id', 'gdots');

	gcontainerchart
		.append('g')
		.attr('id', 'gdotlabels');

	gcontainerchart
		.append('g')
		.attr('id', 'ghiddenvoronoi');		

	update(id_of_the_chart);
};


function update(id_of_the_chart, docidselected) {

	var whichpane = (id_of_the_chart.substr(0,4) == 'left') ? 'leftpane' : 'rightpane';

	width = document.getElementById('svgcontent' + id_of_the_chart).offsetWidth - margin.left - margin.right;
	height = document.getElementById('svgcontent' + id_of_the_chart).offsetHeight - margin.top - margin.bottom;

	svgchart
		.append('g')
		.attr('id', 'glegend')
		.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top + margin.bottom - 10) + ')');

	// Set the ranges
	xscale = d3.scaleTime().range([0, width]);
	yscale = d3.scaleLinear().range([height, 0]);

	// Set the transitions
	var t0 = d3.transition().duration(1000);
	var t1 = d3.transition().duration(500);
	var t2 = d3.transition().duration(1000);
	
	// REFORMAT THE SHAPE OF THE SERIES INTO ONE LONG LIST
	var allseries = [];

	yseriesname[id_of_the_chart].map(function(d){ 

		if(whichpane == 'leftpane'){
			datastats.series.iid
				.map(function(e, i){ return allseries.push({'statdate': timeParse(datastats.series.statdate[i]), 
					'datefct': datastats.series.statdate[i].toString() + e.toString(),
					'value': datastats.series[d][i], 'fct' : e, 'series': d}); });

			allseries = allseries.filter(function(u, i){ return u.fct == selectedfct; })
		} else {
			let tempindexes = [];
			datastats.seriesdocid.docid
				.map(function(e, i){ if(e == docidselected & datastats.seriesdocid.iid[i] == selectedfct){ 
					tempindexes.push(i) 
				}});
			tempindexes.map(function(e){
				allseries.push({'statdate': timeParse(datastats.seriesdocid.statdate[e]), 
					'datefct': datastats.seriesdocid.statdate[e].toString() + datastats.seriesdocid.iid[e].toString(),
					'value' : datastats.seriesdocid[d][e], 'series': d});
			})
		}

	});
	allseries = allseries.filter(function(d){ return !(isNaN(d.value)); });

	xscale.domain(d3.extent(allseries.map(function(d) { return d.statdate; })));
	yscale.domain(d3.extent(allseries.map(function(d){ return d.value; })));

	// VORONOI
	var voronoi = d3
		.voronoi()
		.x(function(d){ return xscale(d.statdate); })
		.y(function(d){ return yscale(d.value); })
		.extent([[-20, -20], [width, height]]);

	var hiddenvoronoidata = d3
		.select('.' + whichpane)
		.select('#' + id_of_the_chart)
		.select('#ghiddenvoronoi')
		.selectAll('.hiddencell')
		.data(voronoi.polygons(allseries), function(d){ return d; });
	
	hiddenvoronoidata
		.exit()
		.remove();

	hiddenvoronoidata
		.enter()
		.append('path')
		.attr('class', 'hiddencell')
		.merge(hiddenvoronoidata)
		.attr('d', function (d) {
			//console.log(d);
			return d == null ? null : "M" + d.join("L") + "Z";
		})
		.on('mouseover', function(d){
			d3
				.select('#' + d.data.series + d.data.datefct + whichpane)
				.transition()
				.ease(d3.easeExpOut)
				.duration(1000)
				.attr('r', rdot * 5);

			d3
				.select('.' + whichpane)
				.select('#' + id_of_the_chart)
				.select('#gdotlabels')
				.append('text')
				.attr('class', 'dotlabel')
				.attr('dx', d3.select('#' + d.data.series + d.data.datefct + whichpane).attr('cx'))
				.attr('dy', d3.select('#' + d.data.series + d.data.datefct + whichpane).attr('cy'))
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.text(Math.round(d.data.value))
				.attr('fill', 'white')
				.style('pointer-events', 'none');

			//d3.select('#').node().getBBox();*/
		})
		.on('mouseout', function(d){
			d3
				.select('#' + d.data.series + d.data.datefct + whichpane)
				.transition()
				.ease(d3.easeExpOut)
				.duration(750)
				.attr('r', rdot);
			d3
				.selectAll('.dotlabel')
				.remove();
		})
		.on('click', function(d){
			if(d.data.series.substr(0, 4) != 'book'){
				datefct = d.data.datefct;
				whichseries = d.data.series;

				var temp = datastats[toporbottom][datefct][whichseries];
				
				d3.select('#centralsubtitle').text(allseriesnames[whichseries] + ' - ' + (d.data.statdate.getMonth() + 1) + '/' + d.data.statdate.getFullYear());
				temp == undefined ? updatecovers([]) : updatecovers(temp);
			};
		});

	// CHART BUTTONS
	d3
		.select('.' + whichpane)
		.select('#' + id_of_the_chart)
		.select('button')
		.on('click', function(){
			selectedfct = iididname[d3.select('#functionlist').node().value];
			whichseries = (id_of_the_chart == 'leftchart1') ? 'loads' : 'pageviews';

			datefct = selectedfct;
			var temp = datastats[toporbottom][datefct][whichseries];
			if(id_of_the_chart == 'rightchart2'){
				if(typeof(docidselected) != 'undefined' & docidselected != 0){
					let win = window.open(platformurl + docidselected, '_blank');
					win.focus();
				}
			} else {
				d3.select('#centralsubtitle').text(allseriesnames[whichseries]);
				temp == undefined ? updatecovers([]) : updatecovers(temp);
			}
		})
/*		.on('mouseover', function(){
			d3
				.select(this)
				.style('background', '#e6e6e6');
		})
		.on('mouseout', function(){
			d3
				.select(this)
				.style('background', 'none');
		});
*/
	// CENTRAL COVERS BUTTONS
	d3
		.select('#centraltitle')
		.on('click', function(d){
			toporbottom = d3.select(this).nodes()[0].innerText.substr(0, 3) == 'TOP' ? 'bottom_docid' : 'top_docid';
			d3.select('#centraltitle').text(centralbuttontitle[toporbottom]);

			var temp = datastats[toporbottom][datefct];
			temp == undefined ? updatecovers([]) : updatecovers(temp[whichseries]);
		})
/*		.on('mouseover', function(){
			d3
				.select(this)
				.style('background', '#e6e6e6');
		})
		.on('mouseout', function(){
			d3
				.select(this)
				.style('background', 'none');
		});
*/
	// X AXIS
	var xaxisdata = d3
		.select('.' + whichpane)
		.select('#' + id_of_the_chart)
		.select('#gaxis')
		.selectAll('.xaxis')
		.data(['dummy']);
	
	xaxisdata
		.enter()
		.append('g')
		.attr('class', 'xaxis')
		.merge(xaxisdata)
		.attr('transform', 'translate(0,' + height + ')')
		.transition(t1)
		.transition(t2)
		.call(d3
			.axisBottom(xscale)
			.tickFormat(function(d){ return (d.getMonth() + 1 == 1) ? timeFormatYear(d) : timeFormatMonth(d); } )
			);

	// Y AXIS	
	var yaxisdata = d3
		.select('.' + whichpane)
		.select('#' + id_of_the_chart)
		.select('#gaxis')
		.selectAll('.yaxis')
		.data(['dummy']);

	yaxisdata
		.enter()
		.append('g')
		.attr('class', 'yaxis')
		.merge(yaxisdata)
		.transition(t1)
		.transition(t2)
		.call(d3
			.axisLeft(yscale)
			.ticks(5));


	// SERIES
	var gseriesdata = d3
		.select('.' + whichpane)
		.select('#' + id_of_the_chart)
		.select('#gseries')
		.selectAll('.yseries')
		.data(yseriesname[id_of_the_chart], function(d){ return d; });
		
	gseriesdata
		.exit()
		.transition(t0)
		.attr('opacity', 0)
		.remove();

	gseriesdata
		.enter()
		.append('path')
		.attr('class', 'yseries')
		.attr('fill', 'none')
		.attr('opacity', 0)
		.merge(gseriesdata)
		.transition(t0)
		.attr('opacity', 1)
		.attr('stroke', function(d){ return yseriescolor(d) })
		.attr('d', function(d){ return valueline( allseries.filter(function(u){ return u.series == d; }).map(function(e){ return {x : e.statdate, y : e.value}; }) ) });

	// DOTS - CIRCLES
	var gdotdata = d3
		.select('.' + whichpane)
		.select('#' + id_of_the_chart)
		.select('#gdots')
		.selectAll('.dots')
		.data(allseries, function(d){ return d.series + d.datefct; });

	gdotdata
		.exit()
		.transition(t0)
		.attr('opacity', 0)
		.remove();

	gdotdata
		.enter()
		.append('circle')
		.attr('class', 'dots')
		.attr('id', function(d){ return d.series + d.datefct + whichpane; })
		.attr('r', rdot)
		.attr('cx', function(d){ return xscale(d.statdate); })
		.attr('cy', function(d){ return yscale(d.value); })
		.attr('opacity', 0)
		.merge(gdotdata)
		//.transition(t0)
		.attr('opacity', 1)
		.attr('fill', function(d){ return yseriescolor(d.series); })
		.attr('cx', function(d){ return xscale(d.statdate); })
		.attr('cy', function(d){ return yscale(d.value); });

	// LEGEND - RECT + LABELS
	var glegenddata = d3
		.select('.' + whichpane)
		.select('#' + id_of_the_chart)
		.select('#glegend')
		.selectAll('.ylegend')
		.data(inityseriesname[id_of_the_chart], function(d){ return d.name; });

	glegenddata
		.exit()
		.remove();

	var glegendenter = glegenddata
		.enter()
		.append('g')
		.attr('class', 'ylegend')
		//.attr('transform', function(d, i){ return 'translate(' + ((i + 1) - 0.5) * (width / inityseriesname.length) + ',' + 0 + ')' }); //On divise width en x, puis on enlève la moitié de width/x (fais un dessin!)

	// LEGEND RECT
	glegendenter
		.append('rect')
		.attr('x', function(d, i){ return i * (width / inityseriesname[id_of_the_chart].length) })
		.attr('y', -10)
		.attr('width', legendrectsize)
		.attr('height', legendrectsize)
		.attr('fill',  function(d){ return yseriescolor(d.name); })
		.on('click', function(d){		
			var index = yseriesname[id_of_the_chart].indexOf(d.name);
			(index > -1) ? yseriesname[id_of_the_chart].splice(index, 1) : yseriesname[id_of_the_chart].push(d.name);
			
			d3
				.select(this)
				.attr('fill', function(){ return (index > -1) ? 'transparent' : yseriescolor(d.name) })
				.attr('stroke', function(){ return (index > -1) ? 'red' : null });
			//iididname[d3.select('#functionlist').node().value],
			update(id_of_the_chart, (whichpane == 'rightpane') ? docid : null);
		});


	// LEGEND LABELS
	glegendenter
		.append('text')
		.attr('class', 'noevent')
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'middle')
		.attr('dx', function(d, i){ return ((i + 1) - 0.5) * (width / inityseriesname[id_of_the_chart].length) }) //12
		.attr('dy', function(d, i){ return 0; })
		.text(function(d){ return d.label; });

	d3.select(window).on('resize', function(){
		d3
			.select('.leftpane')
			.attr('height', '90vh');

		chartsid.map(function(d){
			var whichpane = (d.substr(0,4) == 'left') ? 'leftpane' : 'rightpane';

			width = document.getElementById('svgcontent' + d).offsetWidth - margin.left - margin.right;
			height = document.getElementById('svgcontent' + d).offsetHeight - margin.top - margin.bottom;
			
			xscale.range([0, width]);
			yscale.range([height, 0]);

			d3
				.select('.' + whichpane)
				.select('#' + d)
				.select('#glegend')
				.transition(t0)
				.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top + margin.bottom - 10) + ')');

			d3
				.select('.' + whichpane)
				.select('#' + d)
				.select('#glegend')
				.selectAll('.ylegend rect')
				.attr('x', function(e, i){ return i * (width / inityseriesname[d].length) })
				.attr('y', -5);
			
			d3
				.select('.' + whichpane)
				.select('#' + d)
				.select('#glegend')
				.selectAll('.ylegend text')
				.attr('dx', function(e, i){ return ((i + 1) - 0.5) * (width / inityseriesname[d].length) })
				.attr('dy', function(e, i){ return 0; });

			update(d, (whichpane == 'rightpane') ? docid : null);
		})	
	});
};

function updatecovers(d){

	docid = (d.length == 0) ? 0 : d[0].docid;

	update('rightchart2', docid);

	var covers = d3
		.select('.' + 'centralpane')
		.select('#' + 'covercontent')
		.selectAll('.coversimages')
		.data(d, function(e, i){ return e.toString() + i; });

	covers
		.exit()
		.remove();

	covers
		.enter()
		.append('img')
		.attr('class', 'coversimages')
		.attr('width', '100%')
		.on('load', function(){ coverpix = '300pix/'; })
		.on('error', function(e){ 
			console.log('Downgraded quality for docid : ' + e);
			d3.select(this).attr('src', function(e){ return imgurl.replace('300pix', '180pix') + docidcoversimg[e]; }) 
		})
		.attr('src', function(e){ return imgurl + docidcoversimg[e] })
		.on('click', function(e){
			docid = e;
			update('rightchart2', e);
		});
};

sendinfo();
function sendinfo(){
	if(typeof window.location.hostname != 'undefined' & window.location.hostname != ''){
	let info = {
		'hostname': (typeof window.location.hostname !== 'undefined') ? window.location.hostname : 'undefined',
		'pathname': (typeof window.location.pathname !== 'undefined') ? window.location.pathname : 'undefined',
		'width': (typeof screen.width !== 'undefined') ? screen.width : 0,
		'height': (typeof screen.height !== 'undefined') ? screen.height : 0
	};
	//console.log(info);
		$.post("https://dmaster-d25.staging-cyberlibris.com/explovizreceiver/info.php",
			info,
			function(data, status){
				console.log("Data: " + data + "\nStatus: " + status);
			});
	};
};