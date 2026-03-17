import * as React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  useWindowDimensions,
  Platform,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import {
  Geologica_400Regular,
  Geologica_700Bold,
} from '@expo-google-fonts/geologica';
import { Kurale_400Regular } from '@expo-google-fonts/kurale';
import { LinearGradient } from 'expo-linear-gradient';

// SAFE AREA
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
// ICONS
import { SvgXml } from 'react-native-svg';
import { icons } from './icons';

import { EMOTIONS, TIPS, TIPSBAD, TIPSGOOD } from './content';
import { getNextInRotation } from './rotationState';
import { globalStyles as styles } from './globalStyles';

const SCREENS = {
  HOME: 'HOME',
  TIP: 'TIP',
  CHECK: 'CHECK',
  SUCCESS: 'SUCCESS',
  TRY_AGAIN: 'TRY_AGAIN',
  MORE: 'MORE',
};

let locked = false;

const DISCLAIMER_SHORT =
  'Застосунок не заміняє\nкваліфіковану психологічну допомогу';

const DISCLAIMER_MODAL = {
  title: 'Важлива інформація',
  intro: [
    'Застосунок “Calm Parenthood” — це інструмент швидкої самодопомоги, а не лікування.',
    'Він пропонує прості вправи й підказки, щоб знизити напругу “тут і зараз”, коли емоції піднімаються через складні моменти з дітьми.',
  ],
  sections: [
    {
      title: 'Чому застосунок не заміняє психолога/психотерапевта',
      bullets: [
        'Немає діагностики та професійної оцінки стану.',
        'Поради загальні й не враховують вашу історію, контекст і потреби.',
        'Застосунок не забезпечує терапевтичний процес і підтримувальний контакт із фахівцем.',
        'Не підходить для кризових ситуацій або станів із високими ризиками.',
        '“Стало легше” після вправи не означає, що причина труднощів вирішена.',
      ],
    },
    {
      title: 'Коли варто звернутися по професійну допомогу',
      bullets: [
        'Емоційні зриви повторюються часто або стають сильнішими.',
        'Є постійна тривога, безнадія, апатія, проблеми зі сном або апетитом.',
        'З’являються думки про самопошкодження/суїцид або страх, що можете нашкодити собі чи дитині.',
        'У сім’ї загострюються конфлікти або з’являється насильство.',
      ],
    },
    {
      title: 'Про важливе',
      paragraphs: [
        'Просити підтримки — нормально. Цей застосунок може допомогти зробити паузу й м’якше пройти гострий момент, але не замінює кваліфіковану психологічну/психотерапевтичну допомогу.',
      ],
    },
  ],
  footer:
    'Якщо ви зараз у небезпеці — зверніться до екстрених служб у вашій країні.',
};

function useScrollToEndAffordance() {
  const scrollRef = React.useRef(null);
  const layoutHRef = React.useRef(0);
  const contentHRef = React.useRef(0);
  const offsetYRef = React.useRef(0);
  const [show, setShow] = React.useState(false);

  const recompute = React.useCallback((offsetY = 0) => {
    const layoutH = layoutHRef.current || 0;
    const contentH = contentHRef.current || 0;
    const canScroll = contentH > layoutH + 8;
    if (!canScroll) {
      setShow(false);
      return;
    }
    const threshold = 16;
    const atEnd = offsetY + layoutH >= contentH - threshold;
    setShow(!atEnd);
  }, []);

  const onLayout = React.useCallback(
    (e) => {
      layoutHRef.current = e?.nativeEvent?.layout?.height ?? 0;
      recompute(0);
    },
    [recompute]
  );

  const onContentSizeChange = React.useCallback(
    (_w, h) => {
      contentHRef.current = h ?? 0;
      recompute(0);
    },
    [recompute]
  );

  const onScroll = React.useCallback(
    (e) => {
      const y = e?.nativeEvent?.contentOffset?.y ?? 0;
      const layoutH = e?.nativeEvent?.layoutMeasurement?.height;
      const contentH = e?.nativeEvent?.contentSize?.height;
      if (typeof layoutH === 'number') layoutHRef.current = layoutH;
      if (typeof contentH === 'number') contentHRef.current = contentH;
      offsetYRef.current = y;
      recompute(y);
    },
    [recompute]
  );

  const scrollToEnd = React.useCallback(() => {
    scrollRef.current?.scrollToEnd?.({ animated: true });
  }, []);

  const scrollForward = React.useCallback((delta = 300) => {
    const layoutH = layoutHRef.current || 0;
    const contentH = contentHRef.current || 0;
    const currentY = offsetYRef.current || 0;
    const maxY = Math.max(0, contentH - layoutH);
    const nextY = Math.min(maxY, currentY + delta);
    scrollRef.current?.scrollTo?.({ y: nextY, animated: true });
  }, []);

  return {
    scrollRef,
    show,
    onScroll,
    onLayout,
    onContentSizeChange,
    scrollToEnd,
    scrollForward,
  };
}

export default function App() {
  const [screenState, setScreenState] = React.useState({
    screen: SCREENS.HOME,
  });
  const [currentGradientColors, setCurrentGradientColors] = React.useState(
    gradientColorsFor(SCREENS.HOME)
  );
  const [nextGradientColors, setNextGradientColors] = React.useState([]);

  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const gradientToFadeAnim = React.useRef(new Animated.Value(0)).current;
  const screen = screenState.screen;
  const tip = Object.hasOwn(screenState, 'tip') ? screenState.tip : '';
  const emotion = Object.hasOwn(screenState, 'emotion')
    ? screenState.emotion
    : '';
  const [isDisclaimerOpen, setIsDisclaimerOpen] = React.useState(false);
  const [fontsLoaded] = useFonts({
    Geologica_400Regular,
    Geologica_700Bold,
    Kurale_400Regular,
  });
  if (!fontsLoaded) return null;

  function animateToScreenState(state) {
    if (locked) {
      return;
    }
    locked = true;
    setTimeout(() => (locked = false), 300);

    if (screen === state.screen) {
      setScreenState(state);
      return;
    }

    const baseConfig = {
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
      duration: 250,
    };

    if (
      gradientColorsFor(state.screen).toString() !=
      currentGradientColors.toString()
    ) {
      Animated.timing(gradientToFadeAnim, {
        ...baseConfig,
        duration: baseConfig.duration * 2,
        toValue: 1,
      }).start(() => {
        setCurrentGradientColors(() => {
          setTimeout(() => {
            setNextGradientColors([]);
            setTimeout(() => gradientToFadeAnim.setValue(0), 100);
          });
          return gradientColorsFor(state.screen);
        });
      });
      setNextGradientColors(gradientColorsFor(state.screen));
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        ...baseConfig,
        toValue: 0,
      }),
      Animated.timing(scaleAnim, {
        ...baseConfig,
        toValue: 0.95,
      }),
    ]).start(() => {
      setScreenState(state);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          ...baseConfig,
          toValue: 1,
        }),
        Animated.timing(scaleAnim, {
          ...baseConfig,
          toValue: 1,
        }),
      ]).start();
    });
  }

  function goHome() {
    animateToScreenState({ screen: SCREENS.HOME });
  }

  function goMore() {
    animateToScreenState({ screen: SCREENS.MORE });
  }

  async function tryAgain() {
    const pool = TIPSBAD;
    const poolLength = pool ? pool.length : 0;
    let tipBad = '';
    if (poolLength > 0) {
      const index = await getNextInRotation('TIPSBAD', poolLength);
      if (index !== null && index >= 0 && index < poolLength) {
        tipBad = pool[index];
      }
    }
    animateToScreenState({ screen: SCREENS.TRY_AGAIN, tip: tipBad, emotion });
  }

  async function success() {
    const pool = TIPSGOOD;
    const poolLength = pool ? pool.length : 0;
    let tipGood = '';
    if (poolLength > 0) {
      const index = await getNextInRotation('TIPSGOOD', poolLength);
      if (index !== null && index >= 0 && index < poolLength) {
        tipGood = pool[index];
      }
    }
    animateToScreenState({ screen: SCREENS.SUCCESS, tip: tipGood, emotion });
  }

  async function showRandomTip(key = emotion) {
    if (!key) return;
    const pool = TIPS[key];
    const poolLength = pool ? pool.length : 0;
    if (!poolLength) return;
    const index = await getNextInRotation(key, poolLength);
    if (index === null || index < 0 || index >= poolLength) return;
    const candidate = pool[index];
    if (Platform.OS !== 'web') Haptics.selectionAsync();

    const newState = { screen: SCREENS.TIP, emotion: key, tip: candidate };
    animateToScreenState(newState);
  }

  function Header() {
    const safeInsets = useSafeAreaInsets();
    const isHome = screen === SCREENS.HOME;
    return (
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 4,
          marginTop: safeInsets.top,
        }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }} />

          <Pressable
            onPress={goHome}
            disabled={isHome}
            style={({ pressed }) => [
              styles.headerIconBtn,
              isHome && styles.headerBtnDisabled,
              pressed && !isHome && { opacity: 0.8 },
            ]}
            hitSlop={10}>
            <SvgXml xml={icons.home} width={30} height={30} color="#EFEFEF" />
          </Pressable>
        </View>
      </View>
    );
  }

  function Home() {
    return (
      <CenterCard
        title={
          <>
            Як я{'\n'}
            почуваюсь?
          </>
        }>
        <View
          style={{
            gap: 20,
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          {EMOTIONS.map((it) => (
            <EmotionButton
              key={it.key}
              emoji={it.emoji}
              title={it.label}
              subtitle={it.range}
              onPress={() => showRandomTip(it.key)}
            />
          ))}
        </View>
      </CenterCard>
    );
  }

  function HomeDisclaimerLink() {
    const insets = useSafeAreaInsets();
    return (
      <View
        pointerEvents="box-none"
        style={[
          localStyles.disclaimerWrap,
          { paddingBottom: Math.max(10, insets.bottom + 10) },
        ]}>
        <Pressable
          onPress={() => setIsDisclaimerOpen(true)}
          hitSlop={10}
          style={({ pressed }) => [
            localStyles.disclaimerPressable,
            pressed && { opacity: 0.85 },
          ]}>
          <Text style={localStyles.disclaimerText}>{DISCLAIMER_SHORT}</Text>
        </Pressable>
      </View>
    );
  }

  function DisclaimerModal() {
    const insets = useSafeAreaInsets();
    const modalScroll = useScrollToEndAffordance();
    return (
      <Modal
        visible={isDisclaimerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDisclaimerOpen(false)}>
        <View style={localStyles.modalRoot}>
          <Pressable
            style={localStyles.modalBackdrop}
            onPress={() => setIsDisclaimerOpen(false)}
          />

          <View
            style={[
              localStyles.modalCard,
              { marginTop: Math.max(16, insets.top + 12) },
              { marginBottom: Math.max(16, insets.bottom + 12) },
            ]}>
            <View style={localStyles.modalHeaderRow}>
              <Pressable
                onPress={() => setIsDisclaimerOpen(false)}
                hitSlop={10}
                style={({ pressed }) => [
                  localStyles.modalCloseBtn,
                  pressed && { opacity: 0.8 },
                ]}>
                <Text style={localStyles.modalCloseText}>✕</Text>
              </Pressable>
              <Text style={localStyles.modalTitle}>{DISCLAIMER_MODAL.title}</Text>
              <View style={localStyles.modalHeaderSpacer} />
            </View>

            <View style={localStyles.modalScrollWrap}>
              <ScrollView
                ref={modalScroll.scrollRef}
                style={localStyles.modalScroll}
                contentContainerStyle={localStyles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={modalScroll.onScroll}
                scrollEventThrottle={16}
                onLayout={modalScroll.onLayout}
                onContentSizeChange={modalScroll.onContentSizeChange}>
                {DISCLAIMER_MODAL.intro.map((p) => (
                  <Text key={p} style={localStyles.modalBodyText}>
                    {p}
                  </Text>
                ))}

                {DISCLAIMER_MODAL.sections.map((section) => (
                  <View key={section.title} style={{ marginTop: 14 }}>
                    <Text style={localStyles.modalSectionTitle}>
                      {section.title}
                    </Text>

                    {Array.isArray(section.paragraphs) &&
                      section.paragraphs.map((p) => (
                        <Text key={p} style={localStyles.modalBodyText}>
                          {p}
                        </Text>
                      ))}

                    {Array.isArray(section.bullets) &&
                      section.bullets.map((b) => (
                        <View key={b} style={localStyles.modalBulletRow}>
                          <Text style={localStyles.modalBulletGlyph}>•</Text>
                          <Text style={localStyles.modalBulletText}>{b}</Text>
                        </View>
                      ))}
                  </View>
                ))}

                <Text style={localStyles.modalFooterText}>
                  {DISCLAIMER_MODAL.footer}
                </Text>
              </ScrollView>

              <View pointerEvents="none" style={localStyles.modalVerticalFades}>
                <LinearGradient
                  colors={['rgb(255, 255, 255)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={localStyles.modalFadeTop}
                />
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgb(255, 255, 255)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={localStyles.modalFadeBottom}
                />
              </View>

              {modalScroll.show && (
                <Pressable
                  onPress={() => modalScroll.scrollForward(300)}
                  hitSlop={10}
                  style={({ pressed }) => [
                    localStyles.scrollToEndBtn,
                    localStyles.scrollToEndBtnInModal,
                    pressed && { opacity: 0.9 },
                  ]}>
                  <Text style={localStyles.scrollToEndBtnText}>↓</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  function Tip() {
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const tipScroll = useScrollToEndAffordance();
    const maxTipBoxHeight = Math.min(
      440,
      Math.max(240, Math.floor((height - insets.top - insets.bottom) * 0.42))
    );
    const emotionKey = screenState.emotion;
    const meta = EMOTIONS.find((e) => e.key === emotionKey);

    return (
      <CenterCard>
        <Text style={styles.tipEmoji}>{meta.emoji}</Text>
        <Text style={styles.tipEmotion}>{meta.label}</Text>

        <View
          style={[
            styles.tipBox,
            { maxHeight: maxTipBoxHeight, overflow: 'hidden' },
          ]}>
          <ScrollView
            ref={tipScroll.scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 18, paddingBottom: 18 }}
            onScroll={tipScroll.onScroll}
            scrollEventThrottle={16}
            onLayout={tipScroll.onLayout}
            onContentSizeChange={tipScroll.onContentSizeChange}>
            <Text style={styles.tipTextName}>{tip.title}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </ScrollView>
          <View pointerEvents="none" style={localStyles.tipBoxVerticalFades}>
            <LinearGradient
              colors={['rgb(255, 255, 255)',  'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={localStyles.tipBoxFadeTop}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgb(255, 255, 255)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={localStyles.tipBoxFadeBottom}
            />
          </View>

          {tipScroll.show && (
            <Pressable
              onPress={tipScroll.scrollToEnd}
              hitSlop={10}
              style={({ pressed }) => [
                localStyles.scrollToEndBtn,
                pressed && { opacity: 0.9 },
              ]}>
              <Text style={localStyles.scrollToEndBtnText}>↓</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.buttonsRow}>
          <SecondaryButton
            title="Спробую інше"
            onPress={() => showRandomTip()}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            title="Виконано"
            onPress={() => {
              animateToScreenState({ screen: SCREENS.CHECK, emotion });
            }}
            style={{ flex: 1 }}
          />
        </View>
      </CenterCard>
    );
  }

  function Check() {
    return (
      <CenterCard>
        <View
          style={{
            textAlign: 'center',
            alignItems: 'center',
          }}>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.emojiTitle}>🥺</Text>
          </View>
          <Text style={styles.title}>
            Чи вдалось{'\n'}понизити градус{'\n'}напруги?
          </Text>
        </View>
        <View style={styles.buttonsRow}>
          <PrimaryButton
            title="Так"
              onPress={success}
          />
          <SecondaryButton title="Ні" onPress={tryAgain} />
        </View>
      </CenterCard>
    );
  }

  function Success() {
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const successScroll = useScrollToEndAffordance();
    const maxTipBoxHeight = Math.min(
      440,
      Math.max(220, Math.floor((height - insets.top - insets.bottom) * 0.38))
    );
    return (
      <CenterCard>
        <View
          style={{
            textAlign: 'center',
            alignItems: 'center',
          }}>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.emojiTitle}>🥳</Text>
          </View>
          <Text style={styles.titleGreen}>
            Супер!{'\n'}Це маленька {'\n'}перемога
          </Text>
        </View>

        <View
          style={[
            styles.tipBox,
            { maxHeight: maxTipBoxHeight, overflow: 'hidden' },
          ]}>
          <ScrollView
            ref={successScroll.scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 18, paddingBottom: 18 }}
            onScroll={successScroll.onScroll}
            scrollEventThrottle={16}
            onLayout={successScroll.onLayout}
            onContentSizeChange={successScroll.onContentSizeChange}>
            <Text style={styles.tipText}>{tip}</Text>
          </ScrollView>
          <View pointerEvents="none" style={localStyles.tipBoxVerticalFades}>
            <LinearGradient
              colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={localStyles.tipBoxFadeTop}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={localStyles.tipBoxFadeBottom}
            />
          </View>

          {successScroll.show && (
            <Pressable
              onPress={successScroll.scrollToEnd}
              hitSlop={10}
              style={({ pressed }) => [
                localStyles.scrollToEndBtn,
                pressed && { opacity: 0.9 },
              ]}>
              <Text style={localStyles.scrollToEndBtnText}>↓</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.buttonsRow}>
          <PrimaryButton
            title="На головну"
            style={styles.sucBtn}
            onPress={goHome}
          />
        </View>
      </CenterCard>
    );
  }

  function TryAgain() {
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const tryAgainScroll = useScrollToEndAffordance();
    const maxTipBoxHeight = Math.min(
      440,
      Math.max(220, Math.floor((height - insets.top - insets.bottom) * 0.38))
    );
    // беремо випадкову пораду для "невдалось"
    return (
      <CenterCard>
        <View
          style={{
            textAlign: 'center',
            alignItems: 'center',
          }}>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.emojiTitle}>🙏</Text>
          </View>
          <Text style={styles.titleWhite}>Буває і так</Text>
        </View>

        <View
          style={[
            styles.tipBox,
            { maxHeight: maxTipBoxHeight, overflow: 'hidden' },
          ]}>
          <ScrollView
            ref={tryAgainScroll.scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 18, paddingBottom: 18 }}
            onScroll={tryAgainScroll.onScroll}
            scrollEventThrottle={16}
            onLayout={tryAgainScroll.onLayout}
            onContentSizeChange={tryAgainScroll.onContentSizeChange}>
            <Text style={styles.tipText}>{tip}</Text>
          </ScrollView>
          <View pointerEvents="none" style={localStyles.tipBoxVerticalFades}>
            <LinearGradient
              colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={localStyles.tipBoxFadeTop}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={localStyles.tipBoxFadeBottom}
            />
          </View>

          {tryAgainScroll.show && (
            <Pressable
              onPress={tryAgainScroll.scrollToEnd}
              hitSlop={10}
              style={({ pressed }) => [
                localStyles.scrollToEndBtn,
                pressed && { opacity: 0.9 },
              ]}>
              <Text style={localStyles.scrollToEndBtnText}>↓</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.buttonsRow}>
          <SecondaryButton
            title="Спробую ще"
            onPress={() => showRandomTip()}
            style={{ flex: 1, backgroundColor: '#747DB8' }}
          />
          <PrimaryButton
            title="На головну"
            onPress={goHome}
            style={{ flex: 1, backgroundColor: '#747DB8' }}
          />
        </View>
      </CenterCard>
    );
  }

  function More() {
    return (
      <CenterCard title="Більше">
        <Text style={styles.bodyText}>
          Тут можуть бути корисні посилання й промо курсу «Як не зриватись на
          дітей».
        </Text>
      </CenterCard>
    );
  }

  const Content = (
    <>
      <Header />
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}>
        {screen === SCREENS.HOME && <Home />}
        {screen === SCREENS.TIP && <Tip />}
        {screen === SCREENS.CHECK && <Check />}
        {screen === SCREENS.SUCCESS && <Success />}
        {screen === SCREENS.TRY_AGAIN && <TryAgain />}
        {screen === SCREENS.MORE && <More />}
      </Animated.View>
    </>
  );

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.root}>
        <DisclaimerModal />
        {currentGradientColors.length > 0 && (
          <LinearGradient
            colors={currentGradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {nextGradientColors.length > 0 && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { opacity: gradientToFadeAnim },
            ]}>
            <LinearGradient
              colors={nextGradientColors}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
        )}
        <View style={StyleSheet.absoluteFillObject}>{Content}</View>
        <HomeDisclaimerLink />
      </View>
    </SafeAreaProvider>
  );
}

/* ====== утиліти / кнопки ====== */

function gradientColorsFor(screen) {
  if ([SCREENS.HOME, SCREENS.TIP, SCREENS.CHECK].includes(screen)) {
    return ['#F5A488', '#F1B4BB', '#EB9EA7']; // 1-3 екрани
  } else if (screen === SCREENS.SUCCESS) {
    return ['#EAD2AC', '#F0F0F0']; // success
  } else if (screen === SCREENS.TRY_AGAIN) {
    return ['#657ED1', '#A2C5E4']; // try again
  }
  return [];
}

function CenterCard({ title, children }) {
  return (
    <View style={styles.centerWrap}>
      {title && (
        <Text style={[styles.title, { marginBottom: 50 }]}>{title}</Text>
      )}
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function PrimaryButton({ title, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tipBtn,
        style,
        pressed && { opacity: 0.9 },
      ]}>
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );
}

function SecondaryButton({ title, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tipBtn,
        style,
        pressed && { opacity: 0.9 },
      ]}>
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );
}

function EmotionButton({ emoji, title, subtitle, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.emoBtn, pressed && { opacity: 0.9 }]}>
      <Text style={styles.emojiBtnText}>{emoji}</Text>
      <Text style={styles.emoBtnText}>{title}</Text>
      <Text style={styles.btnSubText}>{subtitle}</Text>
    </Pressable>
  );
}

const localStyles = StyleSheet.create({
  disclaimerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  disclaimerPressable: {
    paddingVertical: 10,
  },
  disclaimerText: {
    fontFamily: 'Geologica_400Regular',
    color: '#EFEFEF',
    textDecorationLine: 'underline',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },

  modalRoot: {
    flex: 1,
    justifyContent: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalCard: {
    alignSelf: 'center',
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    paddingBottom: 0,
  },
  modalTitle: {
    flex: 1,
    fontFamily: 'Geologica_700Bold',
    color: '#804550',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 38,
    height: 38,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,69,80,0.08)',
  },
  modalCloseText: {
    fontFamily: 'Geologica_700Bold',
    color: '#804550',
    fontSize: 18,
    lineHeight: 18,
  },
  modalScroll: {
    maxHeight: 520,
  },
  modalScrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
  },
  modalScrollWrap: {
    position: 'relative',
  },
  modalVerticalFades: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  modalFadeTop: {
    width: '100%',
    height: 20,
  },
  modalFadeBottom: {
    width: '100%',
    height: 20,
  },
  modalSectionTitle: {
    fontFamily: 'Geologica_700Bold',
    color: '#7D6C2C',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  modalBodyText: {
    fontFamily: 'Geologica_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#7D6C2C',
    textAlign: 'left',
  },
  modalBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  modalBulletGlyph: {
    fontFamily: 'Geologica_700Bold',
    color: '#7D6C2C',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 0,
  },
  modalBulletText: {
    flex: 1,
    fontFamily: 'Geologica_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#7D6C2C',
  },
  modalFooterText: {
    marginTop: 14,
    fontFamily: 'Geologica_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#804550',
    textAlign: 'left',
  },

  tipBoxVerticalFades: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  tipBoxFadeTop: {
    width: '100%',
    height: 24,
  },
  tipBoxFadeBottom: {
    width: '100%',
    height: 24,
  },

  scrollToEndBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    zIndex: 5,
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 235, 162, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(125,108,44,0.18)',
  },
  scrollToEndBtnInModal: {
    right: 0,
    bottom: 16,
  },
  scrollToEndBtnText: {
    fontFamily: 'Geologica_700Bold',
    fontSize: 18,
    lineHeight: 18,
    color: '#7D6C2C',
  },
});
