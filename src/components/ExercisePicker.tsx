import React from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {ExerciseCatalogEntry} from '../types';
import {EXERCISE_CATALOG} from '../constants/exerciseCatalog';
import {colors} from '../constants/colors';

interface ExercisePickerProps {
  visible: boolean;
  onSelect: (entry: ExerciseCatalogEntry) => void;
  onCancel: () => void;
}

export function ExercisePicker({visible, onSelect, onCancel}: ExercisePickerProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Exercise</Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={EXERCISE_CATALOG}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => onSelect(item)}>
              <View style={styles.thumbWrap}>
                <Image source={item.image} style={styles.thumb} resizeMode="contain" />
              </View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  cancel: {
    fontSize: 15,
    color: colors.primary,
  },
  list: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gym + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  thumb: {
    width: '70%',
    height: '70%',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  chevron: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
