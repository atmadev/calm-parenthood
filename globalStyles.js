import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
// container має бути гнучким контейнером без ScrollView
container: {
  flex: 1,
  paddingHorizontal: 16,
  paddingBottom: 24,
},

// стабільно вирівнюємо зверху; для підняття екранів використовуємо shiftUp
centerWrap: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
},

// ряд із кнопками — по центру, рівна відстань
buttonsRow: {
  flexDirection: 'row',
  gap: 12,
  alignSelf: 'stretch',
  justifyContent: 'center',
  alignItems: 'center',
},


  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerBtn: {
    backgroundColor: '#622626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  headerBtnDisabled: { opacity: 0.6 },
  headerBtnText: {
    color: '#622626',
    fontWeight: '700',
  },

  headerIconBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // minHeight: 520,
  },

  tipEmoji: {
    fontFamily: 'Kurale_400Regular',
    fontSize: 50,
    textAlign: 'center',
    marginBottom: 0,
  },
  tipEmotion: {
    fontFamily: 'Kurale_400Regular',
    fontSize: 35,
    color: '#622626',
    textAlign: 'center',
    marginTop: -20,
  },
  tipEmotionLight: {
    fontFamily: 'Kurale_400Regular',
    fontSize: 35,
    color: '#FBFBFB',
    textAlign: 'center',
    marginTop: -20,
  },
  tipBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    width: 340, // завжди вся ширина картки
    marginTop: 10,

// тінь для iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 3,

  // тінь для Android
  elevation: 3,

  },
  tipTextName: {
    fontFamily: 'Geologica_700Bold',
    fontSize: 16,
    lineHeight: 22,
    color: '#5D5D5D',
    textAlign: 'center',
      marginBottom: 8,
      
  },

  tipText: {
    fontFamily: 'Geologica_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#5D5D5D',
    textAlign: 'left',
    marginBottom: -10
    ,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12, // відстань між кнопками
    alignSelf: 'stretch', // розтягуємо на всю ширину
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontFamily: 'Kurale_400Regular',
    color: '#622626',
    fontSize: 40,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 20, // відстань між заголовком і контентом
  },

  titleGreen: {
    fontFamily: 'Kurale_400Regular',
    color: '#524B31',
    fontSize: 35,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 37,
    marginBottom: 5, // відстань між заголовком і контентом
  },

  titleWhite: {
    fontFamily: 'Kurale_400Regular',
    color: '#ffffff',
    fontSize: 35,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 37,
    marginBottom: -5, // відстань між заголовком і контентом
  },


  emojiTitle: {
fontSize: 40,
  },

  bodyText: {
    fontFamily: 'Geologica_400Regular',
    color: '#cfe0ff',
    fontSize: 16,
    textAlign: 'center',
  },

  btn: {
    backgroundColor: '#9D5354', opacity: 0.7,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Geologica_400Regular',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },

  emoBtn: {
    backgroundColor: '#ffffff',
    alignSelf: 'stretch',
    width: '100%',
    minHeight: 84,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  emojiBtnText: {
    fontSize: 40,
    lineHeight: 44,
    marginRight: 10,
  },
  emoBtnText: {
    flex: 1,
    fontFamily: 'Geologica_700Bold',
    color: '#622626',
    fontSize: 20,
    lineHeight: 24,
    marginLeft: 12,
  },
  btnSubText: {
    fontFamily: 'Geologica_400Regular',
    color: '#622626',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 14,
    marginRight: 14,
  },

  btnSecondary: {
    backgroundColor: '#1a2742',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#cfe0ff',
    fontSize: 16,
    fontWeight: '700',
  },

  tipBtn: {
    backgroundColor: '#9D5354',
    opacity: 0.7,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    height: 45,
    marginTop: 30,
  },

  checkBtnDarkBg: {
    // use default tipBtn background; no override needed
  },
  checkBtnLightBg: {
    backgroundColor: '#622626',
    opacity: 0.9,
  },

    sucBtn: {
    backgroundColor: '#7D6C2C',
    opacity: 0.5,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '65%',
    height: 45,
    marginTop: 30,
  }, 

});
