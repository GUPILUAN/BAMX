import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { router } from 'expo-router';
import { navigate, replace, goBack } from '../../functions/NavigationService';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

describe('NavigationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigate should call router.push with correct path', () => {
    navigate('Auth');
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(auth)/login',
      params: undefined,
    });
  });

  it('replace should call router.replace with correct path', () => {
    replace('DashBoard');
    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/(drawer)/inicio',
      params: undefined,
    });
  });

  it('goBack should call router.back', () => {
    goBack();
    expect(router.back).toHaveBeenCalled();
  });

  it('should handle navigation with params', () => {
    const params = { id: '123' };
    navigate('Details', params);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/details',
      params,
    });
  });
});