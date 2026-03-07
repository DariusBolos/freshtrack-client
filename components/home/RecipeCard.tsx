import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Recipe } from '@/types/dashboardTypes';
import { useTranslation } from 'react-i18next';

type Props = {
  recipe: Recipe;
};

const RecipeCard: React.FC<Props> = ({ recipe }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/recipe/${recipe.id}`)} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
      <View style={[styles.card, { backgroundColor: theme['background-basic-color-2'] }]}>
        <View style={[styles.iconCircle, { backgroundColor: theme['color-primary-500'] + '18' }]}>
          <FontAwesome5 name={recipe.icon} size={18} color={theme['color-primary-500']} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme['text-basic-color'] }]} numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text style={[styles.meta, { color: theme['text-hint-color'] }]}>
            <FontAwesome5 name="clock" size={10} color={theme['text-hint-color']} /> {recipe.duration} · {recipe.ingredients.length}{' '}
            {t('home.ingredients')}
          </Text>
        </View>
        <FontAwesome5 name="chevron-right" size={12} color={theme['text-hint-color']} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    marginTop: 3,
  },
});

export default RecipeCard;
