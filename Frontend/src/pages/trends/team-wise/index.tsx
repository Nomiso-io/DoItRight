import React from 'react';
import ReactApexChart from 'react-apexcharts';
import '../../../css/metrics/style.css';

export default function TeamWiseChart(props: any) {
  const { assessmentVersions, assessmentVersionScore } = props;

  let chartWidth =
    assessmentVersions.length > 3 ? assessmentVersions.length * 150 : 450;

  let assessmentData = {
    series: [
      {
        name: 'Score',
        data: assessmentVersionScore,
      },
    ],
    options: {
      chart: {
        type: 'line',
        toolbar: {
          tools: {
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
            download: 'Download',
          },
          offsetX: -38,
          offsetY: -20,
        },
      },
      stroke: {
        width: 7,
        curve: 'smooth',
      },
      markers: {
        size: 6,
        colors: ['#7cc9fc'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      xaxis: {
        categories: assessmentVersions,
        title: {
          text: 'Versions',
          style: {
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
        labels: {
          formatter: function (value: number) {
            return 'v' + value;
          },
          style: {
            fontSize: '13px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
      },
      yaxis: {
        max: 100,
        title: {
          text: 'Scores',
          style: {
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
        labels: {
          style: {
            fontSize: '13px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
      },
      tooltip: {
        x: {
          formatter: function (value: number) {
            return 'Version - ' + value;
          },
        },
        y: {
          formatter: function (value: number) {
            return value;
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        paddingTop: '40px',
        marginLeft: assessmentVersions.length > 4 ? '0%' : '10%',
      }}
    >
      <ReactApexChart
        options={assessmentData.options}
        series={assessmentData.series}
        type='line'
        height='400'
        width={chartWidth}
      />
    </div>
  );
}
