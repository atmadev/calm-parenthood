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
    backgroundColor: '#1a2742',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  headerBtnDisabled: { opacity: 0.6 },
  headerBtnText: {
    color: 'white',
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
    color: '#804550',
    textAlign: 'center',
    marginTop: -20,
  },
  tipBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: 340, // завжди вся ширина картки
    marginTop: 30,

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
    color: '#7D6C2C',
    textAlign: 'center',
      marginBottom: 8,
      
  },

  tipText: {
    fontFamily: 'Geologica_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#7D6C2C',
    textAlign: 'left',
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
    color: '#804550',
    fontSize: 35,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 37,
    marginBottom: 30, // відстань між заголовком і контентом
  },

  titleGreen: {
    fontFamily: 'Kurale_400Regular',
    color: '#7D6C2C',
    fontSize: 35,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 37,
    marginBottom: -5, // відстань між заголовком і контентом
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
    backgroundColor: '#2a77ff',
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
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    height: 200,

    // тінь для iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 3,

  // тінь для Android
  elevation: 3,
    
  },
  emojiBtnText: {
    fontFamily: 'Geologica_400Bold',
    color: '#804550',
    fontSize: 50,
    fontWeight: '700',
    marginBottom: 1,
  },
  emoBtnText: {
    fontFamily: 'Geologica_400Bold',
    color: '#804550',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSubText: {
    fontFamily: 'Geologica_400Regular',
    color: '#804550',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#B77481',
    opacity: 0.7,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    height: 45,
    marginTop: 30,
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
