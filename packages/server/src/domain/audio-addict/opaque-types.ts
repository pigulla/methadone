import { type Opaque } from 'type-fest'

export type ApiKey = Opaque<string, 'api-key'>
export type SessionToken = Opaque<string, 'session-token'>
export type SessionKey = Opaque<string, 'session-key'>
export type AudioToken = Opaque<string, 'audio-token'>
export type ListenKey = Opaque<string, 'listen-key'>
export type SubscriptionID = Opaque<number, 'subscription-id'>
export type MemberID = Opaque<number, 'member-id'>
