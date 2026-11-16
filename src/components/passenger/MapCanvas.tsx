import React, { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import { ABEOKUTA_CENTER, ABEOKUTA_LANDMARKS, buildRouteWaypoints } from '../../data/landmarks';
import { DriverProfile, Landmark, RideRecord, SosAlert } from '../../types';

interface MapCanvasProps {
  pickup: Landmark | null;
  destination: Landmark | null;
  drivers: DriverProfile[];
  activeRide: RideRecord | null;
  sosAlerts?: SosAlert[];
  onSelectLandmark?: (landmark: Landmark) => void;
  focusCenter?: [number, number];
}

function createOkadaBikeIcon(isAssigned: boolean): L.DivIcon {
  const fill = isAssigned ? '#059669' : '#111827';
  const ring = isAssigned ? '#D1FAE5' : '#FFFFFF';
  return L.divIcon({
    className: 'okada-div-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    html: `
      <div style="width:38px;height:38px;border-radius:9999px;background:${fill};border:3px solid ${ring};box-shadow:0 4px 12px rgba(17,24,39,0.28);display:flex;align-items:center;justify-content:center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    `,
  });
}

function createPinIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: 'okada-div-icon',
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:30px;height:30px;border-radius:9999px;background:${color};border:3px solid #FFFFFF;box-shadow:0 4px 10px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:11px;font-family:'Plus Jakarta Sans',sans-serif;">
          ${label}
        </div>
        <div style="width:3px;height:10px;background:${color};margin-top:-2px;border-radius:2px;"></div>
      </div>
    `,
  });
}

function createLandmarkDotIcon(selected: boolean): L.DivIcon {
  return L.divIcon({
    className: 'okada-div-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:${selected ? '#059669' : '#FFFFFF'};border:2.5px solid ${selected ? '#FFFFFF' : '#111827'};box-shadow:0 2px 6px rgba(0,0,0,0.22);"></div>`,
  });
}

function createSosIcon(): L.DivIcon {
  return L.divIcon({
    className: 'okada-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `
      <div style="width:40px;height:40px;border-radius:9999px;background:#DC2626;border:3px solid #FFFFFF;box-shadow:0 0 0 6px rgba(220,38,38,0.3);display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:800;font-size:11px;font-family:'JetBrains Mono',monospace;">
        SOS
      </div>
    `,
  });
}

const MapViewportController: React.FC<{
  pickup: Landmark | null;
  destination: Landmark | null;
  focusCenter?: [number, number];
}> = ({ pickup, destination, focusCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && destination) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [64, 64], maxZoom: 15, animate: true });
    } else if (pickup) {
      map.flyTo([pickup.lat, pickup.lng], 14, { duration: 0.6 });
    } else if (focusCenter) {
      map.flyTo(focusCenter, 13, { duration: 0.6 });
    }
  }, [map, pickup, destination, focusCenter]);

  return null;
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  pickup,
  destination,
  drivers,
  activeRide,
  sosAlerts = [],
  onSelectLandmark,
  focusCenter,
}) => {
  const effectivePickup = activeRide?.pickup ?? pickup;
  const effectiveDestination = activeRide?.destination ?? destination;

  const routePositions = useMemo(() => {
    if (!effectivePickup || !effectiveDestination) return [];
    return buildRouteWaypoints(effectivePickup, effectiveDestination);
  }, [effectivePickup, effectiveDestination]);

  const pickupPinIcon = useMemo(() => createPinIcon('#059669', 'A'), []);
  const destPinIcon = useMemo(() => createPinIcon('#111827', 'B'), []);
  const sosPinIcon = useMemo(() => createSosIcon(), []);

  const onlineDrivers = drivers.filter((d) => d.isOnline && d.kycStatus === 'approved');
  const openSos = sosAlerts.filter((s) => !s.resolved);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[ABEOKUTA_CENTER.lat, ABEOKUTA_CENTER.lng]}
        zoom={13}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapViewportController
          pickup={effectivePickup}
          destination={effectiveDestination}
          focusCenter={focusCenter}
        />

        {/* Local Abeokuta Landmarks */}
        {ABEOKUTA_LANDMARKS.map((landmark) => {
          const isEndpoint =
            effectivePickup?.id === landmark.id || effectiveDestination?.id === landmark.id;
          if (isEndpoint) return null;

          return (
            <Marker
              key={landmark.id}
              position={[landmark.lat, landmark.lng]}
              icon={createLandmarkDotIcon(false)}
              eventHandlers={{
                click: () => onSelectLandmark?.(landmark),
              }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-gray-900">{landmark.name}</p>
                  <p className="text-gray-500">{landmark.area}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Searching Radar Radius (1.5km) */}
        {activeRide?.status === 'searching' && effectivePickup && (
          <Circle
            center={[effectivePickup.lat, effectivePickup.lng]}
            radius={1500}
            pathOptions={{
              color: '#059669',
              fillColor: '#059669',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '6 6',
            }}
          />
        )}

        {/* Route Polyline */}
        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#059669',
              weight: 5,
              opacity: 0.9,
            }}
          />
        )}

        {/* Pickup & Destination Pins */}
        {effectivePickup && (
          <Marker position={[effectivePickup.lat, effectivePickup.lng]} icon={pickupPinIcon}>
            <Popup>
              <div className="text-xs font-semibold text-gray-900">
                Pickup: {effectivePickup.name}
              </div>
            </Popup>
          </Marker>
        )}

        {effectiveDestination && (
          <Marker
            position={[effectiveDestination.lat, effectiveDestination.lng]}
            icon={destPinIcon}
          >
            <Popup>
              <div className="text-xs font-semibold text-gray-900">
                Dropoff: {effectiveDestination.name}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Online Verified Okada Riders */}
        {onlineDrivers.map((driver) => {
          const isAssigned = activeRide?.driverId === driver.id;
          return (
            <Marker
              key={driver.id}
              position={[driver.lat, driver.lng]}
              icon={createOkadaBikeIcon(isAssigned)}
            >
              <Popup>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-gray-900">{driver.name}</p>
                  <p className="font-mono text-gray-700">{driver.plateNumber}</p>
                  <p className="text-emerald-700 font-medium">{driver.bikeModel}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active SOS Markers */}
        {openSos.map((alert) => (
          <Marker key={alert.id} position={[alert.lat, alert.lng]} icon={sosPinIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-red-700">ACTIVE SOS ALERT</p>
                <p className="text-gray-900">
                  {alert.driverName} · <span className="font-mono">{alert.plateNumber}</span>
                </p>
                <p className="text-gray-600">{alert.pickupName} → {alert.destinationName}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
