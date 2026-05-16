import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRecipes } from '@/hooks/useRecipes';
import Spinner from '@/components/Spinner';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#F44336',
};

const RecipeDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const { data: recipes = [], isLoading: isRecipesLoading } = useRecipes();
  const recipe = recipes.find((r) => r.id === id);

  if (isRecipesLoading) {
    return <Spinner size="medium" />;
  }

  if (!recipe) {
    return (
      <View style={[styles.center, { backgroundColor: theme['background-basic-color-1'] }]}>
        <FontAwesome5 name="exclamation-triangle" size={48} color={theme['text-disabled-color']} />
        <Text style={[styles.notFoundText, { color: theme['text-hint-color'] }]}>{t('recipe_detail.not_found')}</Text>
      </View>
    );
  }

  const difficultyColor = DIFFICULTY_COLORS[recipe.difficulty] ?? theme['text-hint-color'];

  return (
    <View style={[styles.screen, { backgroundColor: theme['background-basic-color-1'] }]}>
      <View style={[styles.header, { backgroundColor: theme['background-basic-color-2'] }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <FontAwesome5 name="arrow-left" size={18} color={theme['text-basic-color']} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme['text-basic-color'] }]} numberOfLines={1}>
          {recipe.title}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme['background-basic-color-2'] }]}>
          <View style={[styles.heroIcon, { backgroundColor: theme['color-primary-500'] + '18' }]}>
            <FontAwesome5 name={recipe.icon} size={36} color={theme['color-primary-500']} />
          </View>
          <Text style={[styles.recipeName, { color: theme['text-basic-color'] }]}>{recipe.title}</Text>
          <Text style={[styles.description, { color: theme['text-hint-color'] }]}>{recipe.description}</Text>

          <View style={styles.metaRow}>
            <MetaBadge icon="clock" label={recipe.duration} theme={theme} />
            <MetaBadge icon="user-friends" label={`${recipe.servings} ${t('recipe_detail.servings')}`} theme={theme} />
            <MetaBadge icon="signal" label={t(`recipe_detail.difficulty_${recipe.difficulty}`)} theme={theme} color={difficultyColor} />
          </View>
        </View>

        <View style={[styles.timeCard, { backgroundColor: theme['background-basic-color-2'] }]}>
          <TimeRow icon="cut" label={t('recipe_detail.prep_time')} value={recipe.prepTime} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme['text-hint-color'] + '15' }]} />
          <TimeRow icon="fire-alt" label={t('recipe_detail.cook_time')} value={recipe.cookTime} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme['text-hint-color'] + '15' }]} />
          <TimeRow icon="hourglass-half" label={t('recipe_detail.total_time')} value={recipe.duration} theme={theme} accent />
        </View>

        <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('recipe_detail.ingredients')}</Text>
        <View style={[styles.listCard, { backgroundColor: theme['background-basic-color-2'] }]}>
          {recipe.ingredients.map((ingredient, i) => (
            <View
              key={i}
              style={[
                styles.ingredientRow,
                i < recipe.ingredients.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme['background-basic-color-3'],
                },
              ]}
            >
              <View style={[styles.bullet, { backgroundColor: theme['color-primary-500'] }]} />
              <Text style={[styles.ingredientText, { color: theme['text-basic-color'] }]}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('recipe_detail.preparation')}</Text>
        <View style={styles.stepsContainer}>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: theme['color-primary-500'] }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={[styles.stepCard, { backgroundColor: theme['background-basic-color-2'] }]}>
                <Text style={[styles.stepText, { color: theme['text-basic-color'] }]}>{step}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

type MetaBadgeProps = {
  icon: string;
  label: string;
  theme: Record<string, string>;
  color?: string;
};

const MetaBadge: React.FC<MetaBadgeProps> = ({ icon, label, theme, color }) => {
  const accent = color ?? theme['color-primary-500'];
  return (
    <View style={[metaStyles.badge, { backgroundColor: accent + '15', borderColor: accent + '40' }]}>
      <FontAwesome5 name={icon} size={12} color={accent} />
      <Text style={[metaStyles.label, { color: accent }]}>{label}</Text>
    </View>
  );
};

const metaStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});

type TimeRowProps = {
  icon: string;
  label: string;
  value: string;
  theme: Record<string, string>;
  accent?: boolean;
};

const TimeRow: React.FC<TimeRowProps> = ({ icon, label, value, theme, accent }) => (
  <View style={timeStyles.row}>
    <FontAwesome5 name={icon} size={14} color={accent ? theme['color-primary-500'] : theme['text-hint-color']} style={timeStyles.icon} />
    <Text style={[timeStyles.label, { color: theme['text-hint-color'] }]}>{label}</Text>
    <Text
      style={[
        timeStyles.value,
        { color: accent ? theme['color-primary-500'] : theme['text-basic-color'] },
        accent && { fontWeight: '800' },
      ]}
    >
      {value}
    </Text>
  </View>
);

const timeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  icon: {
    width: 24,
    textAlign: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  notFoundText: {
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  heroCard: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  recipeName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },

  timeCard: {
    borderRadius: 14,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },

  listCard: {
    borderRadius: 14,
    paddingVertical: 4,
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  stepsContainer: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
});

export default RecipeDetail;
