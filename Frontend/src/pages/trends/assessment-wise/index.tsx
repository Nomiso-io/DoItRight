import React from 'react';
import ReactApexChart from 'react-apexcharts';
import '../../../css/metrics/style.css';

export default function AssessmentWiseChart(props: any) {
  const { assessmentTeamsName, assessmentTeamsScore, levelColor } = props;

  let chartHeight =
    assessmentTeamsName.length === 1
      ? 120
      : assessmentTeamsName.length > 3
      ? assessmentTeamsName.length * 50
      : 160;

  let assessmentData = {
    series: [
      {
        name: 'Score',
        data: assessmentTeamsScore,
      },
    ],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          tools: {
            download: 'Download',
          },
          offsetX: -48,
          offsetY: -70,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: assessmentTeamsName,
        labels: {
          style: {
            fontSize: '13px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
        title: {
          text: 'Scores',
          style: {
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
        max: 100,
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '13px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
        title: {
          text: 'Teams',
          style: {
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
      },
      colors: levelColor,
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
      },
      legend: {
        show: false,
      },
    },
  };

  return (
    <div style={{ paddingTop: '20px', width: '90%' }}>
      <ReactApexChart
        options={assessmentData.options}
        series={assessmentData.series}
        type='bar'
        height={chartHeight}
      />
    </div>
  );
}
