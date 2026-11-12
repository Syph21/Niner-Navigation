import MapView, { Marker } from '../components/Map';
import Callout from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native'
import { NINER_GREEN, GOLD, WHITE, SOFT_GRAY, NEAR_BLACK } from '../lib/theme'

// iOS/MAC marker image URL - will use default pin for now
// On Android, we can customize the pin color

export default function CampusMapNative({
  centerLat,
  centerLng,
  zoom = 15,
  buildings = [],
  onBuildingPress,
}: {
  centerLat: number
  centerLng: number
  zoom?: number
  buildings: any[]
  onBuildingPress?: (building: any) => void
}) {
  // Calculate region delta from zoom level for initialRegion
  // Higher zoom = smaller delta = more zoomed in
  const latitudeDelta = 360 / Math.pow(2, zoom / 2);
  const longitudeDelta = latitudeDelta / Math.cos((centerLat * Math.PI) / 180);

  return (
    <MapView
      style={styles.map}
      initialRegion={{ latitude: centerLat, longitude: centerLng, latitudeDelta, longitudeDelta }}
      loadingEnabled={true}
      mapType="standard"
    >
      {buildings.map((building) => {
        const { lat, lng, name, abbreviation } = building
        return (
          <Marker
            key={building.id}
            coordinate={{ latitude: lat, longitude: lng }}
            pinColor="green"
          >
            <Callout>
              <View style={styles.calloutStyle}>
                <Text style={styles.calloutTextStyle}>{name}</Text>
                {abbreviation && (
                  <Text style={styles.calloutAbbreviationStyle}>{abbreviation}</Text>
                )}
              </View>
            </Callout>
          </Marker>
        )
      })}

      {/* Center marker - blue dot representation */}
      <Marker
        coordinate={{ latitude: centerLat, longitude: centerLng }}
        title="Current Location"
        description="You are here"
        pinColor="blue"
      />
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  calloutStyle: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    alignItems: 'center',
    width: '80%',
  },
  calloutTextStyle: {
    color: NEAR_BLACK,
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  calloutAbbreviationStyle: {
    color: GOLD,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
})