import React, {useState} from 'react';
import {
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import {colors} from '../constants/colors';

interface ExerciseImageProps {
  source: ImageSourcePropType;
  size?: number;
}

export function ExerciseImage({source, size = 44}: ExerciseImageProps) {
  const [enlarged, setEnlarged] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setEnlarged(true)}
        style={[styles.thumbWrap, {width: size, height: size, borderRadius: size / 2}]}>
        <Image source={source} style={styles.thumb} resizeMode="contain" />
      </TouchableOpacity>

      <Modal
        visible={enlarged}
        transparent
        animationType="fade"
        onRequestClose={() => setEnlarged(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setEnlarged(false)}>
          <Image source={source} style={styles.large} resizeMode="contain" />
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  thumbWrap: {
    backgroundColor: colors.gym + '20',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: '70%',
    height: '70%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  large: {
    width: '100%',
    height: '70%',
  },
});
