import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchReviews, submitReview } from '../api/reviews';
import StarRatingInput from '../components/StarRatingInput';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';

export default function WriteReviewScreen({ route, navigation }) {
  const { type, id, placeName } = route.params;
  const { user } = useAuth();
  const { t } = useLocale();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill with the user's existing review for this place, if any —
  // submitting again edits it rather than starting blank each time.
  useEffect(() => {
    fetchReviews(type, id)
      .then(({ data }) => {
        const mine = data.find((review) => review.user.id === user.id);
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment ?? '');
        }
      })
      .finally(() => setIsLoading(false));
  }, [type, id, user.id]);

  const handleSubmit = () => {
    if (rating === 0) {
      setError(t('reviews.pickRatingError'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    submitReview(type, id, { rating, comment: comment.trim() })
      .then(() => navigation.goBack())
      .catch(() => {
        setError(t('reviews.submitError'));
        setIsSubmitting(false);
      });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {isLoading ? (
          <ActivityIndicator color="#FFD400" style={styles.spinner} />
        ) : (
          <View style={styles.content}>
            <Text style={styles.placeName} numberOfLines={2}>
              {placeName}
            </Text>

            <Text style={styles.label}>{t('reviews.ratingLabel')}</Text>
            <StarRatingInput value={rating} onChange={setRating} />

            <Text style={styles.label}>{t('reviews.commentLabel')}</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('reviews.commentPlaceholder')}
              placeholderTextColor="#6A6A6A"
              multiline
              numberOfLines={5}
              maxLength={1000}
              style={styles.textarea}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        )}

        <View style={styles.footer}>
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [styles.submitButton, (pressed || isSubmitting) && styles.pressed]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <Text style={styles.submitLabel}>{t('reviews.submitAction')}</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },
  spinner: {
    marginTop: spacing.xl,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  placeName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  textarea: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2E2E2E',
    borderRadius: 14,
    padding: spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#FFFFFF',
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#2E2E2E',
  },
  submitButton: {
    backgroundColor: '#FFD400',
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },
  pressed: {
    opacity: 0.8,
  },
});
