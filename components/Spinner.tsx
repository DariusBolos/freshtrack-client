import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';

type Props = {
  size?: 'small' | 'medium' | 'large';
  label?: string;
  fullScreen?: boolean;
  color?: string;
};

const SIZE_MAP = {
  small: 24,
  medium: 36,
  large: 52,
};

const STROKE_MAP = {
  small: 2.5,
  medium: 3.5,
  large: 4.5,
};

const Spinner: React.FC<Props> = ({ size = 'medium', label, fullScreen = false, color }) => {
  const theme = useTheme();
  const accent = color ?? theme['color-primary-500'];
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const dim = SIZE_MAP[size];
  const stroke = STROKE_MAP[size];

  const ring = (
    <View style={{ width: dim, height: dim }}>
      <View
        style={[
          styles.track,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            borderWidth: stroke,
            borderColor: accent + '22',
          },
        ]}
      />
      <Animated.View
        style={[
          styles.arc,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            borderWidth: stroke,
            borderTopColor: accent,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme['background-basic-color-1'] }]}>
        <View style={[styles.card, { backgroundColor: theme['background-basic-color-2'] }]}>
          {ring}
          {label && <Text style={[styles.label, { color: theme['text-hint-color'] }]}>{label}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      {ring}
      {label && <Text style={[styles.label, { color: theme['text-hint-color'] }]}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
  },
  arc: {
    position: 'absolute',
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 14,
    minWidth: 120,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Spinner;
