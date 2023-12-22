import { ArrowUpOutlined } from "@ant-design/icons";
import moment from "moment";
import React from "react";

const Steps = ({ steps = [], position = "top-left", isMobile = false }) => {
  let time = moment.utc(1000 * steps[0].duration).format("HH[h] mm[m]");
  time = time.replace("00h", "");

  const positionStyle = {
    "top-left": {
      top: "10px",
      left: "10px",
    },
    "top-right": {
      top: "10px",
      right: "10px",
    },
    "bottom-left": {
      bottom: "10px",
      left: "10px",
    },
    "bottom-right": {
      bottom: "10px",
      right: "10px",
    },
    bottom: {
      bottom: 30,
      width: "100%",
      minHeight: 100,
    },
  };
  return (
    <div
      style={{
        position: "absolute",
        minHeight: 50,
        width: 300,
        zIndex: 1,
        backgroundColor: "#000",
        filter: "opacity(0.8)",
        color: "#fff",
        padding: "15px",
        display: "flex",
        gap: 20,
        ...positionStyle[position],
      }}
    >
      <ArrowUpOutlined
        style={{
          fontSize: 25,
          color: "green",
        }}
      />
      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {steps[0].maneuver.instruction} upto {Math.round(steps[0].distance)}m
        </div>
        <div>{time} </div>
      </div>
    </div>
  );
};

export default Steps;
