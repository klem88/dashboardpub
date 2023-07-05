///////////////////////// 
datainput = 'https://dmaster-d25.staging-cyberlibris.com/data/dashboardpub/configpublishers.json';
/////////////////////////

d3.select('#opendefinitions').on('click', function(){ window.open('definitions.html', '_blank'); });


d3.json(datainput)
	.then(function(data){
		console.log(data);
		d3
			.select('#cidlist')
			.selectAll('.option')
			.data(data
				//.filter(function(d){ return d.calculated == 1; })
				.sort(function(a, b){ return (a.publishername < b.publishername) ? -1 : (a.publishername > b.publishername) ? 1 : 0 }), function(d){ return 'id' + d.cid; })
			.enter()
			.append('option')
			.attr('class', 'option')
			.attr('value', function(d){ return d.publishername + d.pid; })
			.text(function(d){ return d.publishername; })

		d3
			.select('#execdashboardclient')
			.on('click', function(){
				let temp = d3.select('#cidlist').node().value;

				console.log(temp)
				window.open('../index.html?name=' + temp, '_blank');
				//window.open('http://vis-dashboard.staging-cyberlibris.com/?cid=' + temp[0] + '&ref=' + temp[1], '_blank');
			});			

	});

