import React, { useState } from 'react';
import moment from 'moment';
import teaComponent from '../mock-tea-component-fixed';
import DateRangePicker from './DateRangePicker';
import '../styles/DateRangeExample.css';

const { Form } = teaComponent;

const DateRangeExample: React.FC = () => {
  const [dateRange1, setDateRange1] = useState<[moment.Moment, moment.Moment]>([
    moment('2020-10-01'),
    moment('2020-11-11')
  ]);
  
  const [dateRange2, setDateRange2] = useState<[moment.Moment, moment.Moment]>([
    moment('2020-10-01 10:30'),
    moment('2020-11-11 22:30')
  ]);

  return (
    <div className="date-range-example">
      <h2>日期区间选择器示例</h2>
      
      <Form layout="vertical">
        <Form.Item label="基本用法">
          <DateRangePicker
            defaultValue={dateRange1}
            onChange={value => {
              if (value) {
                setDateRange1(value);
                console.log(
                  value[0].format('YYYY/MM/DD'),
                  value[1].format('YYYY/MM/DD')
                );
              }
            }}
          />
          <div className="date-value">
            已选择: {dateRange1[0].format('YYYY/MM/DD')} 至 {dateRange1[1].format('YYYY/MM/DD')}
          </div>
        </Form.Item>
        
        <Form.Item label="自定义时间格式">
          <DateRangePicker
            separator="至"
            format="YYYY-MM-DD HH:mm"
            defaultValue={dateRange2}
            placeholder={['开始时间', '结束时间']}
            onChange={value => {
              if (value) {
                setDateRange2(value);
                console.log(value[0].format(), value[1].format());
              }
            }}
          />
          <div className="date-value">
            已选择: {dateRange2[0].format('YYYY-MM-DD HH:mm')} 至 {dateRange2[1].format('YYYY-MM-DD HH:mm')}
          </div>
        </Form.Item>
      </Form>
      
      <div className="instructions">
        <h3>使用说明</h3>
        <ul>
          <li>直接在输入框中输入日期时间</li>
          <li>格式必须与指定格式一致</li>
          <li>点击清除按钮可以重置日期选择</li>
        </ul>
      </div>
    </div>
  );
};

export default DateRangeExample; 