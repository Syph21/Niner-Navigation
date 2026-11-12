import { View, Text } from 'react-native';

export default function MapView(props: any) {
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, props.style]}>
      <Text>Map is only available on iOS and Android.</Text>
    </View>
  );
}
export const Marker = (_props: any) => null;
export const Polygon = (_props: any) => null;