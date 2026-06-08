import React, { useRef, useState, useEffect } from 'react';
import { Alert, Animated, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, X, Image as ImageIcon, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, radii, rs, spacing, type } from '../theme/palette';
import { IconButton } from '../ui/IconButton';
import { GradientButton } from '../ui/GradientButton';
import { useAppStore, DiaryEntry } from '../state/AppStore';
import { useToast } from '../ui/Toast';

type Props = {
  initial?: DiaryEntry;
  onClose: () => void;
};

export const DiaryAddEdit: React.FC<Props> = ({ initial, onClose }) => {
  const isEdit = !!initial;
  const [photoUri, setPhotoUri] = useState(initial?.photoUri ?? '');
  const [fishName, setFishName] = useState(initial?.fishName ?? '');
  const [weight, setWeight] = useState(initial?.weight ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [submitting, setSubmitting] = useState(false);

  const { addDiaryEntry, updateDiaryEntry } = useAppStore();
  const toast = useToast();

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [fade]);

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
        includeBase64: false,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Photo Library', result.errorMessage ?? 'Unable to access photo library.');
        return;
      }
      const uri = result.assets?.[0]?.uri;
      if (uri) setPhotoUri(uri);
    } catch (e) {
      Alert.alert('Photo Library', 'Unable to open photo library.');
    }
  };

  const onSubmit = async () => {
    if (!photoUri.trim()) return toast.show('Please select a photo', 'warn');
    if (!fishName.trim()) return toast.show('Please enter a species name', 'warn');
    if (!weight.trim()) return toast.show('Please enter a weight', 'warn');
    if (!location.trim()) return toast.show('Please enter a location', 'warn');
    if (!description.trim()) return toast.show('Please add a short description', 'warn');

    setSubmitting(true);
    try {
      if (isEdit && initial) {
        await updateDiaryEntry(initial.id, {
          photoUri: photoUri.trim(),
          fishName: fishName.trim(),
          weight: weight.trim(),
          location: location.trim(),
          description: description.trim(),
        });
        toast.show('Entry updated');
      } else {
        await addDiaryEntry({
          photoUri: photoUri.trim(),
          fishName: fishName.trim(),
          weight: weight.trim(),
          location: location.trim(),
          description: description.trim(),
        });
        toast.show('Entry saved to diary');
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <LinearGradient
        colors={['#020A1A', '#040D24', '#020A1A']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <IconButton onPress={onClose} bg="rgba(2,10,26,0.55)">
            <X size={rs(18)} color={palette.textPrimary} />
          </IconButton>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Entry' : 'Log a Catch'}</Text>
          <View style={{ width: rs(40) }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Field label="PHOTO" required>
              <Pressable onPress={pickImage} style={styles.photoBox}>
                {photoUri ? (
                  <>
                    <Image source={{ uri: photoUri }} style={styles.photoFill} />
                    <View style={styles.photoOverlay}>
                      <ImageIcon size={rs(16)} color="#FFFFFF" />
                      <Text style={styles.photoOverlayText}>Replace photo</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.photoEmpty}>
                    <View style={styles.photoIconWrap}>
                      <Camera size={rs(24)} color={palette.accent} />
                    </View>
                    <Text style={styles.photoText}>Add a photo from gallery</Text>
                    <Text style={styles.photoHint}>Tap to choose an image</Text>
                  </View>
                )}
              </Pressable>
            </Field>

            <Field label="SPECIES NAME" required>
              <Input value={fishName} onChangeText={setFishName} placeholder="e.g. Yellowtail (Buri)" />
            </Field>

            <Field label="WEIGHT" required>
              <Input value={weight} onChangeText={setWeight} placeholder="e.g. 2.5 kg" keyboardType="numbers-and-punctuation" />
            </Field>

            <Field label="LOCATION" required>
              <Input value={location} onChangeText={setLocation} placeholder="e.g. Ise Bay Coast" />
            </Field>

            <Field label="DESCRIPTION" required>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your day — conditions, technique, atmosphere"
                multiline
                numberOfLines={5}
                style={{ minHeight: rs(110), textAlignVertical: 'top' }}
              />
            </Field>

            <View style={{ height: spacing.l }} />
            <GradientButton
              variant="accent"
              label={isEdit ? 'Save Changes' : 'Log This Entry'}
              icon={<Save size={rs(18)} color="#FFFFFF" />}
              onPress={onSubmit}
              disabled={submitting}
              glow
              fullWidth
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>
      {label} {required ? <Text style={styles.required}>*</Text> : null}
    </Text>
    {children}
  </View>
);

const Input: React.FC<React.ComponentProps<typeof TextInput>> = ({ style, ...rest }) => (
  <TextInput
    {...rest}
    placeholderTextColor={palette.textSubtle}
    style={[styles.input, style]}
  />
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
  },
  headerTitle: { ...type.h2, color: palette.textPrimary },
  body: { paddingHorizontal: spacing.l, paddingBottom: spacing.xxl },
  field: { marginBottom: spacing.m },
  fieldLabel: { ...type.micro, color: palette.textMuted, marginBottom: rs(6) },
  required: { color: palette.accent },
  input: {
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.m,
    paddingVertical: rs(12),
    ...type.body,
    color: palette.textPrimary,
  },
  photoBox: {
    backgroundColor: palette.bgCard,
    borderRadius: radii.lg,
    borderColor: palette.border,
    borderWidth: 1,
    height: rs(180),
    overflow: 'hidden',
  },
  photoFill: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoOverlay: {
    position: 'absolute',
    bottom: spacing.s,
    right: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    paddingHorizontal: rs(10),
    paddingVertical: rs(5),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(2,10,26,0.7)',
  },
  photoOverlayText: { ...type.small, color: '#FFFFFF', fontWeight: '700' as const, fontSize: rs(12) },
  photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoIconWrap: {
    width: rs(58),
    height: rs(58),
    borderRadius: rs(29),
    backgroundColor: 'rgba(255,111,61,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,111,61,0.4)',
    marginBottom: spacing.s,
  },
  photoText: { ...type.body, color: palette.textPrimary, fontWeight: '700' as const },
  photoHint: { ...type.small, color: palette.textSubtle, marginTop: rs(2) },
});
