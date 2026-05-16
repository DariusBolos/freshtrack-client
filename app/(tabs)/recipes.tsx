import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRecipes, useRecipeSuggestions } from '@/hooks/useRecipes';
import RecipeCard from '@/components/home/RecipeCard';
import Spinner from '@/components/Spinner';
import { Recipe } from '@/types/dashboardTypes';

const EXPLORE_BATCH_SIZE = 5;

const RecipesTab = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { data: recipes = [], isLoading: isRecipesLoading } = useRecipes();
  const { mutateAsync: loadMoreRecipes, isPending: isLoadingMore } = useRecipeSuggestions();

  const [exploreRecipes, setExploreRecipes] = useState<Recipe[]>([]);

  const suggestedRecipes = useMemo(() => recipes, [recipes]);

  const handleLoadMore = async () => {
    const fresh = await loadMoreRecipes(EXPLORE_BATCH_SIZE);
    setExploreRecipes((current) => {
      const existingIds = new Set(current.map((recipe) => recipe.id));
      const next = fresh.filter((recipe) => !existingIds.has(recipe.id));
      return [...current, ...next];
    });
  };

  if (isRecipesLoading) {
    return <Spinner size="medium" />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme['background-basic-color-1'] }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FontAwesome5 name="utensils" size={22} color={theme['color-primary-500']} />
          <Text style={[styles.headerTitle, { color: theme['text-basic-color'] }]}>{t('recipes.title')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('recipes.suggested')}</Text>
          {suggestedRecipes.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme['text-hint-color'] }]}>{t('recipes.suggested_empty')}</Text>
          ) : (
            suggestedRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('recipes.explore')}</Text>
          {exploreRecipes.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme['text-hint-color'] }]}>{t('recipes.explore_empty')}</Text>
          ) : (
            exploreRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
          )}

          <Pressable
            style={({ pressed }) => [
              styles.loadMore,
              {
                backgroundColor: theme['background-basic-color-2'],
                borderColor: theme['background-basic-color-3'],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleLoadMore}
            disabled={isLoadingMore}
          >
            <Text style={[styles.loadMoreText, { color: theme['color-primary-500'] }]}>
              {isLoadingMore ? t('recipes.loading_more') : t('recipes.load_more')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyText: {
    fontSize: 13,
  },
  loadMore: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RecipesTab;

