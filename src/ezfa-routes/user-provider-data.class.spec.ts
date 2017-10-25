import {
  MOCK_USER,
  MOCK_USER_INFO_PASSWORD,
  MOCK_USER_INFO_GITHUB,
  MOCK_USER_INFO_GOOGLE,
  MOCK_USER_INFO_TWITTER,
  MOCK_USER_INFO_FACEBOOK
} from '../test';

import { UserProviderData } from './user-provider-data.class';

describe('UserProviderData', () => {
  it('should instantiate correctly when passed null for user and no enabled ids', () => {
    const data = new UserProviderData(null, []);
    expect(data.ids).toEqual([]);
    expect(data.oauthIds).toEqual([]);
    expect(data.hasPassword).toEqual(false);
    expect(data.canAddPassword).toEqual(false);
    expect(data.canAddOauth).toEqual([]);
  })
  it('should instantiate correctly when passed null for user and [password]', () => {
    const data = new UserProviderData(null, ['password']);
    expect(data.ids).toEqual([]);
    expect(data.oauthIds).toEqual([]);
    expect(data.hasPassword).toEqual(false);
    expect(data.canAddPassword).toEqual(true);
    expect(data.canAddOauth).toEqual([]);
  })
  it('should instantiate correctly when passed null for user and [password, twitter.com]', () => {
    const data = new UserProviderData(null, ['password', 'twitter.com']);
    expect(data.ids).toEqual([]);
    expect(data.oauthIds).toEqual([]);
    expect(data.hasPassword).toEqual(false);
    expect(data.canAddPassword).toEqual(true);
    expect(data.canAddOauth).toEqual(['twitter.com']);
  })
  it('should instantiate correctly when passed a user with unenabled providers', () => {
    const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_FACEBOOK]})
    const data = new UserProviderData(user, ['password', 'twitter.com']);
    expect(data.ids).toEqual([]);
    expect(data.oauthIds).toEqual([]);
    expect(data.hasPassword).toEqual(false);
    expect(data.canAddPassword).toEqual(true);
    expect(data.canAddOauth).toEqual(['twitter.com']);
  })
  it('should instantiate correctly when passed a user with enabled providers', () => {
    const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_FACEBOOK]})
    const data = new UserProviderData(user, ['password', 'twitter.com', 'facebook.com']);
    expect(data.ids).toEqual(['facebook.com']);
    expect(data.oauthIds).toEqual(['facebook.com']);
    expect(data.hasPassword).toEqual(false);
    expect(data.canAddPassword).toEqual(true);
    expect(data.canAddOauth).toEqual(['twitter.com']);
  })
  it('should instantiate correctly when passed a user with multiple enabled providers', () => {
    const user = Object.assign({}, MOCK_USER, {providerData: [MOCK_USER_INFO_FACEBOOK, MOCK_USER_INFO_PASSWORD]})
    const data = new UserProviderData(user, ['password', 'twitter.com', 'facebook.com']);
    expect(data.ids).toEqual(['facebook.com', 'password']);
    expect(data.oauthIds).toEqual(['facebook.com']);
    expect(data.hasPassword).toEqual(true);
    expect(data.canAddPassword).toEqual(false);
    expect(data.canAddOauth).toEqual(['twitter.com']);
  })
})
