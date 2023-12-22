import { useWindowWidth } from "@react-hook/window-size";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef, useState } from "react";
import Map, { Layer, Marker, Source, useMap } from "react-map-gl";
import "./App.css";
import Places from "./components/Places";
import Steps from "./components/Steps";
import styleJson from "./style.json";
import { MAPBOX_TOKEN } from "./util/config";

function MapContainer() {
  const map = useRef();
  const mapGl = useMap();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [viewState, setViewState] = useState({
    zoom: 10,
    bearing: 0,
  });
  const [routeStarted, setRouteStarted] = useState(false);
  const [start, setStart] = useState([]);
  const [end, setEnd] = useState([]);
  const [coords, setCoords] = useState([]);
  const [route, setRoute] = useState({});
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (start.length && end.length) {
      getRoute();
    }
  }, [start, end, routeStarted]);

  const getRoute = async () => {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?alternatives=true&overview=full&steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();
    setRoute(data);
    setSteps(data.routes[0].legs[0].steps);
    const coords = data.routes[0].geometry.coordinates;
    setCoords(coords);
    let waypoints = [];
    if (data.waypoints.length > 0) {
      data.waypoints.forEach((waypoint) => {
        waypoints.push([waypoint.location[0], waypoint.location[1]]);
      });
    }
    if (!map?.current) {
      return;
    }
    const dummy = map.current.getMap();
    dummy.fitBounds(waypoints, {
      maxZoom: 16,
      // padding: {
      //   top: 40,
      //   bottom: 40,
      //   left: 100,
      // },
      easing: (t) => t,
    });
    if (routeStarted) {
      dummy.flyTo({
        center: [start[0], start[1]],
        offset: [0, 100],
        zoom: 20,
        speed: 5,
        bearing:
          data && Object.keys(data).length > 0
            ? data.routes[0].legs[0].steps[0].maneuver.bearing_after
            : 0,
        easing: (t) => t,
      });
    } else {
      dummy.fitBounds(waypoints, {
        maxZoom: 16,
        padding: {
          top: 40,
          bottom: 40,
          left: 100,
        },
        easing: (t) => t,
      });
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setStart([position.coords.longitude, position.coords.latitude]);
      setViewState({
        ...viewState,
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      });
      if (!mapGl.current) return;
      mapGl.current.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        offset: [0, 100],
        speed: 5,
      });
    });
  }, []);

  const routeData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [...coords],
        },
      },
    ],
  };

  const startIcon = routeStarted
    ? {
        src: "/map_route.png",
      }
    : {
        src: "/map_location.png",
      };

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Places
        position="top-right"
        isMobile={isMobile}
        onStart={(start) => {
          setStart(start.geometry.coordinates);
        }}
        onDestination={(destination) => {
          setEnd(destination.geometry.coordinates);
        }}
        onRouteStart={() => {
          setRouteStarted(true);
        }}
      />
      {routeStarted && steps.length > 0 ? (
        <Steps
          steps={steps}
          position={isMobile ? "bottom" : "top-left"}
          isMobile={isMobile}
        />
      ) : null}
      {viewState.latitude && viewState.longitude ? (
        <Map
          ref={map}
          {...viewState}
          initialViewState={viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={styleJson}
          mapboxAccessToken={MAPBOX_TOKEN}
          minZoom={5}
          maxZoom={20}
          attributionControl={false}
          onClick={(evt) => {
            setStart([evt.lngLat.lng, evt.lngLat.lat]);
          }}
          pitch={routeStarted ? 60 : 0}
          logoControl={false}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Source id="my-data" type="geojson" data={routeData}>
            <Layer
              id="route"
              type="line"
              source="my-data"
              paint={{
                "line-color": "#007cbf",
                "line-width": routeStarted ? 8 : 5,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </Source>
          <Marker
            longitude={start[0]}
            latitude={start[1]}
            rotationAlignment="auto"
            anchor="center"
          >
            <img
              src={startIcon.src}
              style={{
                width: 30,
                height: 30,
              }}
            />
          </Marker>
          {end.length ? (
            <Marker longitude={end[0]} latitude={end[1]}>
              <div
                style={{
                  width: 15,
                  height: 15,
                  backgroundColor: "red",
                  borderRadius: "50%",
                }}
              ></div>
            </Marker>
          ) : null}
        </Map>
      ) : null}
    </div>
  );
}
export default MapContainer;
