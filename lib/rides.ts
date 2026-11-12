import { supabase } from './supabase-context'
import { useEffect, useState } from 'react'
import * as Location from 'expo-location'

// Haversine formula to calculate distance between two points in km
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Interface for ride request
export interface RideRequest {
  id: string
  rider_id: string
  pickup_lat: number
  pickup_lng: number
  pickup_label: string
  dropoff_lat: number
  dropoff_lng: number
  dropoff_label: string
  seats: number
  status: 'pending' | 'accepted' | 'picked_up' | 'completed' | 'cancelled'
  driver_id?: string
  created_at: string
}

// Interface for driver location
export interface DriverLocation {
  driver_id: string
  lat: number
  lng: number
  is_online: boolean
  updated_at: string
}

// Request a new ride
export const requestRide = async (riderId: string, pickupLat: number, pickupLng: number, pickupLabel: string, dropoffLat: number, dropoffLng: number, dropoffLabel: string, seats: number = 1) => {
  const { data, error } = await supabase
    .from('ride_requests')
    .insert({
      rider_id: riderId,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      pickup_label: pickupLabel,
      dropoff_lat: dropoffLat,
      dropoff_lng: dropoffLng,
      dropoff_label: dropoffLabel,
      seats,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data as RideRequest
}

// Cancel a ride request
export const cancelRide = async (rideId: string) => {
  const { error } = await supabase
    .from('ride_requests')
    .update({ status: 'cancelled' })
    .eq('id', rideId)

  if (error) throw error
}

// Driver accepts a ride request
export const acceptRide = async (rideId: string, driverId: string) => {
  const { data, error } = await supabase
    .from('ride_requests')
    .update({ status: 'accepted', driver_id: driverId })
    .eq('id', rideId)
    .select()
    .single()

  if (error) throw error
  return data as RideRequest
}

// Update ride status
export const updateRideStatus = async (rideId: string, status: RideRequest['status']) => {
  const { error } = await supabase
    .from('ride_requests')
    .update({ status })
    .eq('id', rideId)

  if (error) throw error
}

// Subscribe to ride_requests changes for a specific ride
export const subscribeToRide = (rideId: string, onUpdate: (ride: RideRequest) => void) => {
  const channel = supabase.channel('ride_requests_changes')

  const payload = {
    rideId,
  }

  channel
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ride_requests',
      filter: `id=eq.${rideId}`,
    }, (payload) => {
      onUpdate(payload.new as RideRequest)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Subscribe to driver_locations changes for a specific driver
export const subscribeToDriverLocation = (driverId: string, onUpdate: (location: DriverLocation) => void) => {
  const channel = supabase.channel('driver_locations_changes')

  channel
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'driver_locations',
      filter: `driver_id=eq.${driverId}`,
    }, (payload) => {
      onUpdate(payload.new as DriverLocation)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Get closest drivers within radius using Haversine formula
export const getClosestDrivers = (
  pickupLat: number,
  pickupLng: number,
  driverLocations: DriverLocation[],
  radiusKm: number = 3
) => {
  const onlineDrivers = driverLocations
    .filter(d => d.is_online)
    .map(d => ({
      ...d,
      distance: calculateDistance(pickupLat, pickupLng, d.lat, d.lng),
    }))
    .filter(d => d.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)

  return onlineDrivers
}

// Initialize driver location tracking (call from driver screen)
export const startDriverLocationTracking = async (setDriverLocation: (loc: { lat: number; lng: number; isOnline: boolean }) => void) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return

    const location = await Location.getCurrentPositionAsync({})
    
    setDriverLocation({
      lat: location.coordinate.latitude,
      lng: location.coordinate.longitude,
      isOnline: true,
    })

    // Update location every 10 seconds in foreground
    const locationSubscription = Location.watchPositionAsync(
      {
        accuracy: 'high',
        distanceInterval: 10,
      },
      (loc) => {
        setDriverLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          isOnline: true,
        })
      }
    )

    return () => {
      locationSubscription.remove()
    }
  } catch (error) {
    console.error('Error tracking location:', error)
  }
}
