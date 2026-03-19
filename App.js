import * as React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Image,
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
      '«Я злюсь» є інструментом швидкої самодопомоги та має виключно пізнавально-інформаційний характер. Він не є засобом лікування.',
      'Застосунок пропонує прості вправи та підказки, які можуть допомогти знизити рівень напруги «тут і зараз», коли емоції наростають у складних ситуаціях із дітьми.',
    ],
    sections: [
      {
        title: 'Чому застосунок не замінює психолога/психотерапевта',
        bullets: [
          'Не передбачає діагностики чи професійної оцінки стану.',
          'Рекомендації є загальними й не враховують ваш індивідуальний досвід, контекст і потреби.',
          'Не забезпечує терапевтичного процесу та підтримувального контакту з фахівцем.',
          'Не підходить для кризових ситуацій або станів із підвищеним ризиком.',
          'Полегшення після вправ не означає, що причину труднощів вирішено.',
        ],
      },
      {
        title: 'Коли варто звернутися по професійну допомогу',
        bullets: [
          'Емоційні зриви повторюються часто або стають інтенсивнішими.',
          'Є постійна тривога, відчуття безнадії, апатія, проблеми зі сном чи апетитом.',
          'З’являються думки про самопошкодження/суїцид або страх, що можете нашкодити собі чи дитині.',
          'У сім’ї загострюються конфлікти або з’являється насильство.',
        ],
      },
      {
        title: 'Важливо',
        paragraphs: [
          'Просити підтримки — це нормально. Застосунок може допомогти зробити паузу, щоб повернути собі ясність, внутрішню опору та здатність діяти усвідомлено, а не з імпульсу. Водночас він не замінює кваліфіковану психологічну чи психотерапевтичну допомогу.',
        ],
      },
    ],
    footer:
      'Якщо ви відчуваєте, що не справляєтесь або перебуваєте в небезпеці — будь ласка, зверніться по кваліфіковану психологічну допомогу до спеціаліста у вашій країні.',
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
    gradientColorsForState({ screen: SCREENS.HOME })
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
  const isTipLikeScreen = [SCREENS.TIP, SCREENS.CHECK, SCREENS.SUCCESS, SCREENS.TRY_AGAIN].includes(screen);
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

    const baseConfig = {
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
      duration: 250,
    };

    const targetGradientColors = gradientColorsForState(state);

    if (
      targetGradientColors.toString() !== currentGradientColors.toString()
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
          return targetGradientColors;
        });
      });
      setNextGradientColors(targetGradientColors);
    }

    if (screen === state.screen) {
      setScreenState(state);
      return;
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
    const isDarkTextEmotion = screenState.emotion === 'frustrated' || screenState.emotion === 'irritated';
    const useHomeRed = isHome || ((screen === SCREENS.TIP || screen === SCREENS.CHECK) && isDarkTextEmotion);
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
            <SvgXml
              xml={useHomeRed ? icons.homeRed : icons.home}
              width={30}
              height={30}
              pointerEvents="none"
              style={{ opacity: 0.7 }}
            />
          </Pressable>
        </View>
      </View>
    );
  }

  const emotionThemeFor = (key) => {
    // Matches the screenshot: darker cards at the top, lighter towards the bottom.
    switch (key) {
      case 'furious':
        return { bg: '#622626', text: '#FBFBFB', sub: '#FBFBFB' };
      case 'angry':
        return { bg: '#9D5354', text: '#FBFBFB', sub: '#FBFBFB' };
      case 'irritated':
        return { bg: '#C8936E', text: '#FBFBFB', sub: '#FBFBFB' };
      case 'frustrated':
      default:
        return { bg: '#E0CE91', text: '#622626', sub: '#622626' };
    }
  };

  const isDarkTextEmotion = (key) =>
    key === 'frustrated' || key === 'irritated';

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
            gap: 10,
            flexDirection: 'column', // ⬅️ головне
            alignItems: 'stretch', // щоб кнопки були на всю ширину
            alignSelf: 'stretch',
          }}>
          {EMOTIONS.map((it) => (
            <EmotionButton
              key={it.key}
              emotionKey={it.key}
              theme={emotionThemeFor(it.key)}
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
    const useBurgundyDisclaimer =
      screen === SCREENS.HOME || isDarkTextEmotion(screenState.emotion);
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
          <Text
            style={[
              localStyles.disclaimerText,
              useBurgundyDisclaimer && { color: '#622626', opacity: 0.6 },
            ]}>
            {DISCLAIMER_SHORT}
          </Text>
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
              <Text style={localStyles.modalTitle}>{DISCLAIMER_MODAL.title}</Text>
              <Pressable
                onPress={() => setIsDisclaimerOpen(false)}
                hitSlop={10}
                style={({ pressed }) => [
                  localStyles.modalCloseBtn,
                  pressed && { opacity: 0.8 },
                ]}>
                <Text style={localStyles.modalCloseText}>✕</Text>
              </Pressable>
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
      480,
      Math.max (400, Math.floor((height - insets.top - insets.bottom) * 0.42))
    );
    const emotionKey = screenState.emotion;
    const meta = EMOTIONS.find((e) => e.key === emotionKey);
    const useDarkText = isDarkTextEmotion(emotionKey);

    return (
      <CenterCard>
        <Text style={styles.tipEmoji}>{meta.emoji}</Text>
        <Text
          style={useDarkText ? styles.tipEmotion : styles.tipEmotionLight}>
          {meta.label}
        </Text>

        <View style={styles.tipBox}>
          <View style={{ maxHeight: maxTipBoxHeight, overflow: 'hidden' }}>
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
            {tipScroll.show && (
              <Pressable
                onPress={tipScroll.scrollToEnd}
                hitSlop={10}
                style={({ pressed }) => [
                  localStyles.scrollToEndBtn,
                  localStyles.scrollToEndBtnInTextBox,
                  pressed && { opacity: 0.9 },
                ]}>
                <Text style={localStyles.scrollToEndBtnText}>↓</Text>
              </Pressable>
            )}
          </View>

          <View
            style={[
              styles.buttonsRow,
              {
                marginTop: -10,
                paddingHorizontal: 0,
                paddingBottom: 20,
              },
            ]}>
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
        </View>
      </CenterCard>
    );
  }

  function Check() {
    const useDarkText = isDarkTextEmotion(emotion);
    const buttonBgStyle = useDarkText ? null : styles.checkBtnLightBg;

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
          <Text style={useDarkText ? styles.title : styles.titleWhite}>
            Чи вдалось{'\n'}понизити градус{'\n'}напруги?
          </Text>
        </View>
        <View style={styles.buttonsRow}>
          <PrimaryButton title="Так" onPress={success} style={buttonBgStyle} />
          <SecondaryButton
            title="Ні"
            onPress={tryAgain}
            style={buttonBgStyle}
          />
        </View>
      </CenterCard>
    );
  }

  function Success() {
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const successScroll = useScrollToEndAffordance();
    const maxTipBoxHeight = Math.min(
      480,
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

        <View style={styles.tipBox}>
          <View style={{ maxHeight: maxTipBoxHeight, overflow: 'hidden' }}>
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

            {successScroll.show && (
              <Pressable
                onPress={successScroll.scrollToEnd}
                hitSlop={10}
                style={({ pressed }) => [
                  localStyles.scrollToEndBtn,
                  localStyles.scrollToEndBtnInTextBox,
                  pressed && { opacity: 0.9 },
                ]}>
                <Text style={localStyles.scrollToEndBtnText}>↓</Text>
              </Pressable>
            )}
          </View>

          <View
            style={[
              styles.buttonsRow,
              {
                marginTop: -15,
                paddingHorizontal:0,
                paddingBottom:20,
              },
            ]}>
            <PrimaryButton
              title="На головну"
              style={[styles.sucBtn, { flex: 1 }]}
              onPress={goHome}
            />
          </View>
        </View>
      </CenterCard>
    );
  }

  function TryAgain() {
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const tryAgainScroll = useScrollToEndAffordance();
    const maxTipBoxHeight = Math.min(
      480,
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

        <View style={styles.tipBox}>
          <View style={{ maxHeight: maxTipBoxHeight, overflow: 'hidden' }}>
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

            {tryAgainScroll.show && (
              <Pressable
                onPress={tryAgainScroll.scrollToEnd}
                hitSlop={10}
                style={({ pressed }) => [
                  localStyles.scrollToEndBtn,
                  localStyles.scrollToEndBtnInTextBox,
                  pressed && { opacity: 0.9 },
                ]}>
                <Text style={localStyles.scrollToEndBtnText}>↓</Text>
              </Pressable>
            )}
          </View>

          <View
            style={[
              styles.buttonsRow,
              {
                marginTop: -10,
                paddingHorizontal: 0,
                paddingBottom: 20
              ,
              },
            ]}>
            <SecondaryButton
              title="Спробую ще"
              onPress={() => showRandomTip()}
              style={{ flex: 1, backgroundColor: '#5A6394', opacity: 0.7 }}
            />
            <PrimaryButton
              title="На головну"
              onPress={goHome}
              style={{ flex: 1, backgroundColor: '#5A6394', opacity: 0.7 }}
            />
          </View>
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
          isTipLikeScreen ? { marginTop: -30 } : null,
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

  const gradientVectorFor = (screenKey) => {
    // Home needs a true top->bottom gradient; others keep the existing diagonal.
    if (screenKey === SCREENS.HOME) {
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
    }
    return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
  };

  const gradientVector = gradientVectorFor(screen);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.root}>
        <DisclaimerModal />
        {currentGradientColors.length > 0 && (
          <LinearGradient
            colors={currentGradientColors}
            style={StyleSheet.absoluteFillObject}
            start={gradientVector.start}
            end={gradientVector.end}
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
              start={gradientVector.start}
              end={gradientVector.end}
            />
          </Animated.View>
        )}
        {/* Texture overlay for all screens */}
        <View
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none">
          <Image
            source={require('./assets/bgtexturepng.png')}
            style={{ width: '100%', height: '100%', resizeMode: 'cover', opacity: 1}}
          />
        </View>
        <View style={StyleSheet.absoluteFillObject}>{Content}</View>
        <HomeDisclaimerLink />
      </View>
    </SafeAreaProvider>
  );
}

/* ====== утиліти / кнопки ====== */

const EMOTION_GRADIENTS = {
  frustrated: ['#E9D9A8', '#F7F2E4'],
  irritated: ['#C8936E', '#DBCB97'],
  angry: ['#9D5354', '#C8936E'],
  furious: ['#622626', '#9D5354'],
};

function gradientColorsForState(state) {
  const screen = state?.screen;
  const emotionKey = state?.emotion;

  if (screen === SCREENS.HOME) {
    return ['#F7F2E4', '#FBFBFB'];
  }

  if (screen === SCREENS.TIP || screen === SCREENS.CHECK) {
    if (emotionKey && EMOTION_GRADIENTS[emotionKey]) {
      return EMOTION_GRADIENTS[emotionKey];
    }
    // Fallback to generic tip/check gradient if emotion is missing.
    return ['#9D5354', '#C8936E'];
  }

  if (screen === SCREENS.SUCCESS) {
    return ['#A9A57E', '#F7F2E4'];
  }

  if (screen === SCREENS.TRY_AGAIN) {
    return ['#263062', '#AEBDC7'];
  }

  return [];
}

function CenterCard({ title, children }) {
  return (
    <View style={styles.centerWrap}>
      {title && (
        <Text style={[styles.title, { marginBottom: 50 }]}>{title}</Text>
      )}
      <View style={{ gap: 12, width: '100%', maxWidth: 340, alignSelf: 'center' }}>
        {children}
      </View>
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

function EmotionButton({ emotionKey, theme, emoji, title, subtitle, onPress }) {
  const bg = theme?.bg ?? '#FBFBFB';
  const text = theme?.text ?? '#622626';
  const sub = theme?.sub ?? '#FBFBFB';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={`emotion-btn-${emotionKey ?? title}`}
      style={({ pressed }) => [
        styles.emoBtn,
        { backgroundColor: bg },
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}>
      <Text style={[styles.emoBtnText, { color: text }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.btnSubText, { color: sub }]}>{subtitle}</Text>
      <Text style={[styles.emojiBtnText, { color: text }]}>{emoji}</Text>
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
    backgroundColor: '#FBFBFB',
    borderRadius: 20,
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#622626',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    flex: 1,
    fontFamily: 'Geologica_700Bold',
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'left',
    textTransform: 'uppercase',
    paddingLeft: 3,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  modalCloseText: {
    fontFamily: 'Geologica_700Bold',
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 18,
  },
  modalScroll: {
    maxHeight: 520,
  },
  modalScrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
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
    width: '89%',
    height: 30,
    marginHorizontal: 20,
  },
  modalFadeBottom: {
    width: '89%',
    height: 40,
    marginHorizontal: 20,
  },
  modalSectionTitle: {
    fontFamily: 'Geologica_700Bold',
    color: '#622626',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  modalBodyText: {
    fontFamily: 'Geologica_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#444444',
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
    color: '#622626',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 0,
  },
  modalBulletText: {
    flex: 1,
    fontFamily: 'Geologica_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#444444',
  },
  modalFooterText: {
    marginTop: 14,
    fontFamily: 'Geologica_700Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#622626',
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
    right: 14,
    bottom: 20,
    backgroundColor: '#622626',
    borderWidth: 0,
  },
  scrollToEndBtnInTextBox: {
    right: 0,
    bottom: 0,
    backgroundColor: '#DBCB97',
    borderWidth: 0,
  },
  scrollToEndBtnText: {
    fontFamily: 'Geologica_700Bold',
    fontSize: 18,
    lineHeight: 18,
    color: '#FFFFFF',
  },
});
