import { Input, Select } from "antd";
import React from "react";

const Home = () => {
  const [value, setValue] = React.useState("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("changed", e);
    setValue(e.target.value);
  };
  return (
    <>
      <Select>
        <Select.Option value="jack">Jack</Select.Option>
        <Select.Option value="lucy">Lucy</Select.Option>
        <Select.Option value="disabled" disabled>
          Disabled
        </Select.Option>
      </Select>
      <Input value={value} placeholder="Basic usage" onChange={onChange} />
    </>
  );
};

export default Home;
