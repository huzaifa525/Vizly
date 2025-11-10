import ReactECharts from 'echarts-for-react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveSankey } from '@nivo/sankey';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { ResponsiveFunnel } from '@nivo/funnel';
import { ResponsiveSunburst } from '@nivo/sunburst';

interface ChartRendererProps {
  type: string;
  data: any[];
  config: any;
}

const ChartRenderer = ({ type, data, config }: ChartRendererProps) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
  }

  const xKey = config.xAxis || Object.keys(data[0])[0];
  const yKeys = config.yAxis || [Object.keys(data[0])[1]];

  // ECharts configurations
  const getEChartsOption = () => {
    const xAxisData = data.map((item) => item[xKey]);

    switch (type) {
      case 'line':
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'axis' },
          legend: { data: yKeys, bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: xAxisData, boundaryGap: false },
          yAxis: { type: 'value' },
          series: yKeys.map((key: string) => ({
            name: key,
            type: 'line',
            smooth: true,
            data: data.map((item) => item[key]),
          })),
        };

      case 'bar':
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { data: yKeys, bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: xAxisData },
          yAxis: { type: 'value' },
          series: yKeys.map((key: string) => ({
            name: key,
            type: 'bar',
            data: data.map((item) => item[key]),
          })),
        };

      case 'horizontal_bar':
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { data: yKeys, bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: xAxisData },
          series: yKeys.map((key: string) => ({
            name: key,
            type: 'bar',
            data: data.map((item) => item[key]),
          })),
        };

      case 'stacked_bar':
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { data: yKeys, bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: xAxisData },
          yAxis: { type: 'value' },
          series: yKeys.map((key: string) => ({
            name: key,
            type: 'bar',
            stack: 'total',
            data: data.map((item) => item[key]),
          })),
        };

      case 'area':
      case 'stacked_area':
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'axis' },
          legend: { data: yKeys, bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: xAxisData, boundaryGap: false },
          yAxis: { type: 'value' },
          series: yKeys.map((key: string) => ({
            name: key,
            type: 'line',
            stack: type === 'stacked_area' ? 'total' : undefined,
            areaStyle: {},
            smooth: true,
            data: data.map((item) => item[key]),
          })),
        };

      case 'pie':
      case 'donut':
        const pieData = data.map((item) => ({
          name: item[xKey],
          value: item[yKeys[0]],
        }));
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
          legend: { orient: 'vertical', left: 'left' },
          series: [{
            name: yKeys[0],
            type: 'pie',
            radius: type === 'donut' ? ['40%', '70%'] : '70%',
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          }],
        };

      case 'scatter':
      case 'bubble':
        const scatterData = data.map((item) => [item[xKey], item[yKeys[0]], item[yKeys[1]] || 10]);
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'item' },
          grid: { left: '3%', right: '7%', bottom: '7%', containLabel: true },
          xAxis: { type: 'value', scale: true },
          yAxis: { type: 'value', scale: true },
          series: [{
            name: config.title || 'Data',
            type: 'scatter',
            symbolSize: type === 'bubble' ? (val: any) => val[2] : 10,
            data: scatterData,
          }],
        };

      case 'gauge':
        return {
          title: { text: config.title || '', left: 'center' },
          series: [{
            type: 'gauge',
            detail: { formatter: '{value}%' },
            data: [{ value: data[0][yKeys[0]], name: xKey }],
          }],
        };

      case 'radar':
        const radarIndicator = yKeys.map((key: string) => ({ name: key, max: Math.max(...data.map((d) => d[key])) }));
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: {},
          legend: { data: data.map((d) => d[xKey]), bottom: 0 },
          radar: { indicator: radarIndicator },
          series: [{
            type: 'radar',
            data: data.map((item) => ({
              value: yKeys.map((key: string) => item[key]),
              name: item[xKey],
            })),
          }],
        };

      case 'candlestick':
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: xAxisData },
          yAxis: { type: 'value', scale: true },
          series: [{
            type: 'candlestick',
            data: data.map((item) => [item.open, item.close, item.low, item.high]),
          }],
        };

      case 'boxplot':
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'item' },
          grid: { left: '10%', right: '10%', bottom: '15%' },
          xAxis: { type: 'category', data: xAxisData },
          yAxis: { type: 'value' },
          series: [{
            name: 'boxplot',
            type: 'boxplot',
            data: data.map((item) => [item.min, item.q1, item.median, item.q3, item.max]),
          }],
        };

      case 'waterfall':
        return {
          title: { text: config.title || '', left: 'center' },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: xAxisData },
          yAxis: { type: 'value' },
          series: [{
            type: 'bar',
            stack: 'Total',
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent',
            },
            emphasis: {
              itemStyle: {
                borderColor: 'transparent',
                color: 'transparent',
              },
            },
            data: data.map((item, index) => {
              let sum = 0;
              for (let i = 0; i < index; i++) {
                sum += data[i][yKeys[0]];
              }
              return sum;
            }),
          }, {
            name: yKeys[0],
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              position: 'top',
            },
            data: data.map((item) => item[yKeys[0]]),
          }],
        };

      default:
        return {};
    }
  };

  // Nivo-based charts
  const renderNivoChart = () => {
    switch (type) {
      case 'heatmap':
        const heatmapData = data.map((item) => ({
          id: item[xKey],
          data: yKeys.map((key: string) => ({ x: key, y: item[key] })),
        }));
        return (
          <ResponsiveHeatMap
            data={heatmapData}
            margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
            axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -90,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            colors={{
              type: 'sequential',
              scheme: 'blues',
            }}
            legends={[{
              anchor: 'bottom',
              translateX: 0,
              translateY: 30,
              length: 400,
              thickness: 8,
              direction: 'row',
            }]}
          />
        );

      case 'treemap':
        const treemapData = {
          name: 'root',
          children: data.map((item) => ({
            name: item[xKey],
            value: item[yKeys[0]],
          })),
        };
        return (
          <ResponsiveTreeMap
            data={treemapData}
            identity="name"
            value="value"
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            labelSkipSize={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
            parentLabelPosition="left"
            parentLabelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
          />
        );

      case 'sunburst':
        const sunburstData = {
          name: 'root',
          children: data.map((item) => ({
            name: item[xKey],
            value: item[yKeys[0]],
          })),
        };
        return (
          <ResponsiveSunburst
            data={sunburstData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            id="name"
            value="value"
            cornerRadius={2}
            borderColor={{ theme: 'background' }}
            colors={{ scheme: 'nivo' }}
            childColor={{ from: 'color', modifiers: [['brighter', 0.1]] }}
            enableArcLabels={true}
            arcLabelsSkipAngle={10}
          />
        );

      case 'funnel':
        const funnelData = data.map((item) => ({
          id: item[xKey],
          value: item[yKeys[0]],
          label: item[xKey],
        }));
        return (
          <ResponsiveFunnel
            data={funnelData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            shapeBlending={0.66}
            colors={{ scheme: 'spectral' }}
            borderWidth={20}
            labelColor={{ from: 'color', modifiers: [['darker', 3]] }}
            enableBeforeSeparators={false}
            enableAfterSeparators={false}
          />
        );

      case 'sankey':
        // Sankey requires nodes and links format
        const nodes = Array.from(new Set([...data.map((d) => d.source), ...data.map((d) => d.target)])).map((id) => ({ id }));
        const links = data.map((d) => ({ source: d.source, target: d.target, value: d.value }));
        return (
          <ResponsiveSankey
            data={{ nodes, links }}
            margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
            align="justify"
            colors={{ scheme: 'category10' }}
            nodeOpacity={1}
            nodeThickness={18}
            nodeSpacing={24}
            nodeBorderWidth={0}
            linkOpacity={0.5}
            linkBlendMode="multiply"
            enableLinkGradient={true}
          />
        );

      default:
        return null;
    }
  };

  // Render ECharts-based visualizations
  if (['line', 'bar', 'horizontal_bar', 'stacked_bar', 'grouped_bar', 'area', 'stacked_area', 'pie', 'donut', 'scatter', 'bubble', 'gauge', 'radar', 'candlestick', 'boxplot', 'waterfall'].includes(type)) {
    return (
      <div className="w-full h-full">
        <ReactECharts option={getEChartsOption()} style={{ height: '100%', width: '100%' }} />
      </div>
    );
  }

  // Render Nivo-based visualizations
  if (['heatmap', 'treemap', 'sunburst', 'funnel', 'sankey'].includes(type)) {
    return (
      <div className="w-full h-full">
        {renderNivoChart()}
      </div>
    );
  }

  return <div className="flex items-center justify-center h-full text-gray-500">Unsupported chart type: {type}</div>;
};

export default ChartRenderer;
