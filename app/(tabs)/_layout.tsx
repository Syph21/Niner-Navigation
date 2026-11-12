import { Tabs } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NINER_GREEN, GOLD, WHITE, INACTIVE_GRAY } from '../../lib/theme'

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name']

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'map', title: 'Map', icon: 'map-marker' },
  { name: 'schedule', title: 'Schedule', icon: 'calendar' },
  { name: 'services', title: 'Services', icon: 'view-grid' },
  { name: 'profile', title: 'Profile', icon: 'account-circle' },
]

export default function TabsLayout() {
  return (
    <Tabs
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: NINER_GREEN,
        tabBarInactiveTintColor: INACTIVE_GRAY,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopColor: GOLD,
          borderTopWidth: 2,
        },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name={icon} size={size} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
