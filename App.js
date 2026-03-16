import * as React from 'react';
import {
  View,
  Text,
  Pressable,
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

  function tryAgain() {
    const pool = TIPSBAD;
    const tipBad =
      pool && pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : '';
    animateToScreenState({ screen: SCREENS.TRY_AGAIN, tip: tipBad, emotion });
  }

    function success() {
  const pool = TIPSGOOD;
  const tipGood =
    pool && pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : '';
  animateToScreenState({ screen: SCREENS.SUCCESS, tip: tipGood, emotion });
}

  function showRandomTip(key = emotion) {
    if (!key) return;
    const pool = TIPS[key];
    if (!pool?.length) return;
    let candidate = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && candidate === tip) {
      candidate = pool[(pool.indexOf(candidate) + 1) % pool.length];
    }
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

  function Tip() {
    const emotionKey = screenState.emotion;
    const meta = EMOTIONS.find((e) => e.key === emotionKey);

    return (
      <CenterCard>
        <Text style={styles.tipEmoji}>{meta.emoji}</Text>
        <Text style={styles.tipEmotion}>{meta.label}</Text>

        <View style={styles.tipBox}>
          <Text style={styles.tipTextName}>{tip.title}</Text>
          <Text style={styles.tipText}>{tip.text}</Text>
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
          <Text style={styles.tipText}>{tip}</Text>
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
          <Text style={styles.tipText}>{tip}</Text>
        </View>

        <View style={styles.buttonsRow}>
          <SecondaryButton
            title="Спробую ще"
            style={styles.tryBtn}
            onPress={() => showRandomTip()}
            style={{ flex: 1, backgroundColor: '#747DB8' }}
          />
          <PrimaryButton
            title="На головну"
            style={styles.tryBtn}
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