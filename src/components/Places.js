import { EnvironmentOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import React, { useEffect, useState } from "react";
import { MAPBOX_TOKEN } from "../util/config";

const Places = ({
  position = "top-left",
  isMobile = false,
  onStart = () => {},
  onDestination = () => {},
  onRouteStart = () => {},
}) => {
  const [value, setValue] = useState({
    start: null,
    destination: null,
  });
  const [places, setPlaces] = useState([]);
  const [options, setOptions] = useState([]);
  let [currentLocation, setCurrentLocation] = useState([]);

  useEffect(() => {
    getCurrentPosition();
  }, []);

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
  };

  const getCurrentPosition = () => {
    let coords = [];
    navigator.geolocation.getCurrentPosition((position) => {
      coords.push(position.coords.longitude, position.coords.latitude);
      setCurrentLocation({
        geometry: {
          coordinates: coords,
        },
      });
    });
  };

  const fetchPlaces = async (searchText) => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json?access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();
    let options = [
      {
        key: 0,
        label: "Current Location",
        value: "Current Location",
      },
    ];
    setPlaces([currentLocation, ...data.features]);
    data.features.forEach((place, idx) => {
      options.push({
        key: idx + 1,
        label: place.place_name,
        value: place.place_name,
      });
    });
    setOptions(options);
  };

  return (
    <div
      style={{
        minHeight: 100,
        width: isMobile ? "90%" : 300,
        padding: "15px",
        backgroundColor: "#fff",
        position: "absolute",
        zIndex: 1,
        display: "flex",
        gap: 20,
        borderRadius: 10,
        ...positionStyle[position],
      }}
    >
      <div
        style={{
          width: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 10,
          gap: 5,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            border: "2px solid #000",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            borderLeft: "2px dotted #000",
            height: 40,
          }}
        />
        <EnvironmentOutlined />
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Select
          showSearch
          labelInValue
          value={value.start?.label}
          placeholder="Select Starting Point"
          notFoundContent={null}
          filterOption={false}
          onSearch={fetchPlaces}
          options={options}
          onSelect={(start) => {
            setValue({
              ...value,
              start: start,
            });
            setOptions([]);
            onStart(places[start.key]);
          }}
          size="large"
          style={{ width: "100%" }}
        />

        <Select
          showSearch
          labelInValue
          value={value?.destination?.label}
          placeholder="Select Destination "
          notFoundContent={null}
          filterOption={false}
          onSearch={fetchPlaces}
          options={options}
          onSelect={(end) => {
            setValue({
              ...value,
              destination: end,
            });
            setOptions([]);
            onDestination(places[end.key]);
          }}
          size="large"
          style={{ width: "100%" }}
        />
        <Button
          style={{
            width: 100,
            display: "flex",
            alignSelf: "flex-end",
          }}
          onClick={onRouteStart}
          type="primary"
          disabled={!value.start || !value.destination}
        >
          Start Route
        </Button>
      </div>
    </div>
  );
};

export default Places;
