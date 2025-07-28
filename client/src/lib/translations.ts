interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    title: "FoxChat",
    subtitle: "Real-time chat rooms with privacy",
    labelLang: "Language:",
    labelUserName: "Username:",
    labelSeed: "Room Code (Seed):",
    labelPassword: "Password (optional):",
    joinBtn: "Join Room",
    usernamePlaceholder: "Enter your name",
    seedPlaceholder: "Enter room code (leave blank for random)",
    passwordPlaceholder: "Enter password if required",
    msgPlaceholder: "Type your message...",
    sendBtn: "Send",
    leaveBtn: "Leave",
    chatRoom: "Chat Room",
    roomAdmin: "Room Admin",
    commands: "Commands",
    onlineUsers: "Online Users",
    status: "Status",
    connected: "Connected",
    disconnected: "Disconnected",
    you: "You",
    disclaimerNoStore: "This site does NOT store user data centrally.",
    disclaimerRAM: "Messages stay in RAM and are deleted on page exit.",
    disclaimerShared: "Room is shared by everyone with the same Seed.",
    disclaimerWarning: "WARNING: Only present users can see messages.",
    errUsernameLength: "Username must be 2-20 characters long",
    errUsernameInvalid: "Username can only contain letters, numbers, dots, underscores, and hyphens",
    terminalInit: "FoxChat Terminal v2.5.0",
    terminalConnect: "Initializing secure connection...",
    terminalEncrypt: "Loading encryption protocols...",
    terminalWebsocket: "Establishing WebSocket bridge...",
    terminalReady: "Ready for secure communication.",
    terminalSkip: "Press any key to continue...",
    passwordRequired: "Password Required",
    passwordRequiredDesc: "This room is password protected. Enter the password to join room",
    preparingPasswordDialog: "Preparing secure access",
    cancel: "Cancel",
    unlock: "Unlock",
    vhsMode: "VHS Mode",
    toggleVhs: "Toggle VHS Filter"
  },
  tr: {
    title: "FoxChat",
    subtitle: "Gizlilik odaklı gerçek zamanlı sohbet odaları",
    labelLang: "Dil:",
    labelUserName: "Kullanıcı Adı:",
    labelSeed: "Oda Kodu (Seed):",
    labelPassword: "Şifre (isteğe bağlı):",
    joinBtn: "Odaya Gir",
    usernamePlaceholder: "Adınızı girin",
    seedPlaceholder: "Oda kodunu girin (boş bırakın rastgele için)",
    passwordPlaceholder: "Gerekirse şifre girin",
    msgPlaceholder: "Mesajınızı yazın...",
    sendBtn: "Gönder",
    leaveBtn: "Çık",
    chatRoom: "Sohbet Odası",
    roomAdmin: "Oda Yöneticisi",
    commands: "Komutlar",
    onlineUsers: "Çevrimiçi Kullanıcılar",
    status: "Durum",
    connected: "Bağlı",
    disconnected: "Bağlantı Kesildi",
    you: "Sen",
    disclaimerNoStore: "Bu site kullanıcı verilerini merkezi olarak SAKLAMAZ.",
    disclaimerRAM: "Mesajlar RAM'de tutulur ve sayfadan çıkışta silinir.",
    disclaimerShared: "Oda aynı Seed'e sahip herkesle paylaşılır.",
    disclaimerWarning: "UYARI: Sadece mevcut kullanıcılar mesajları görebilir.",
    errUsernameLength: "Kullanıcı adı 2-20 karakter uzunluğunda olmalı",
    errUsernameInvalid: "Kullanıcı adı sadece harfler, rakamlar, noktalar, alt çizgiler ve tireler içerebilir",
    terminalInit: "FoxChat Terminal v2.5.0",
    terminalConnect: "Güvenli bağlantı başlatılıyor...",
    terminalEncrypt: "Şifreleme protokolleri yükleniyor...",
    terminalWebsocket: "WebSocket köprüsü kuruluyor...",
    terminalReady: "Güvenli iletişim için hazır.",
    terminalSkip: "Devam etmek için herhangi bir tuşa basın...",
    passwordRequired: "Şifre Gerekli",
    passwordRequiredDesc: "Bu oda şifre korumalı. Odaya katılmak için şifreyi girin",
    preparingPasswordDialog: "Güvenli erişim hazırlanıyor",
    cancel: "İptal",
    unlock: "Kilidi Aç",
    vhsMode: "VHS Modu",
    toggleVhs: "VHS Filtresini Aç/Kapat"
  },
  es: {
    title: "FoxChat",
    subtitle: "Salas de chat en tiempo real con privacidad",
    labelLang: "Idioma:",
    labelUserName: "Nombre de usuario:",
    labelSeed: "Código de Sala (Seed):",
    labelPassword: "Contraseña (opcional):",
    joinBtn: "Entrar a la Sala",
    usernamePlaceholder: "Ingresa tu nombre",
    seedPlaceholder: "Ingresa código de sala (dejar en blanco para aleatorio)",
    passwordPlaceholder: "Ingresa contraseña si es necesario",
    msgPlaceholder: "Escribe tu mensaje...",
    sendBtn: "Enviar",
    leaveBtn: "Salir",
    chatRoom: "Sala de Chat",
    roomAdmin: "Administrador de Sala",
    commands: "Comandos",
    onlineUsers: "Usuarios En Línea",
    status: "Estado",
    connected: "Conectado",
    disconnected: "Desconectado",
    you: "Tú",
    disclaimerNoStore: "Este sitio NO almacena datos de usuario centralmente.",
    disclaimerRAM: "Los mensajes permanecen en RAM y se eliminan al salir.",
    disclaimerShared: "La sala es compartida por todos con el mismo Seed.",
    disclaimerWarning: "ADVERTENCIA: Solo usuarios presentes pueden ver mensajes.",
    errUsernameLength: "El nombre de usuario debe tener 2-20 caracteres",
    errUsernameInvalid: "El nombre de usuario solo puede contener letras, números, puntos, guiones bajos y guiones",
    terminalInit: "FoxChat Terminal v2.5.0",
    terminalConnect: "Inicializando conexión segura...",
    terminalEncrypt: "Cargando protocolos de encriptación...",
    terminalWebsocket: "Estableciendo puente WebSocket...",
    terminalReady: "Listo para comunicación segura.",
    terminalSkip: "Presiona cualquier tecla para continuar...",
    passwordRequired: "Contraseña Requerida",
    passwordRequiredDesc: "Esta sala está protegida con contraseña. Ingresa la contraseña para unirte a la sala",
    cancel: "Cancelar",
    unlock: "Desbloquear"
  },
  ru: {
    title: "FoxChat",
    subtitle: "Комнаты чата в реальном времени с приватностью",
    labelLang: "Язык:",
    labelUserName: "Имя пользователя:",
    labelSeed: "Код комнаты (Seed):",
    labelPassword: "Пароль (необязательно):",
    joinBtn: "Войти в комнату",
    usernamePlaceholder: "Введите ваше имя",
    seedPlaceholder: "Введите код комнаты (оставьте пустым для случайного)",
    passwordPlaceholder: "Введите пароль если требуется",
    msgPlaceholder: "Введите ваше сообщение...",
    sendBtn: "Отправить",
    leaveBtn: "Выйти",
    chatRoom: "Комната чата",
    roomAdmin: "Администратор комнаты",
    commands: "Команды",
    onlineUsers: "Пользователи онлайн",
    status: "Статус",
    connected: "Подключен",
    disconnected: "Отключен",
    you: "Вы",
    disclaimerNoStore: "Этот сайт НЕ хранит пользовательские данные централизованно.",
    disclaimerRAM: "Сообщения хранятся в RAM и удаляются при выходе.",
    disclaimerShared: "Комната разделяется всеми с одинаковым Seed.",
    disclaimerWarning: "ВНИМАНИЕ: Только присутствующие пользователи могут видеть сообщения.",
    errUsernameLength: "Имя пользователя должно быть длиной 2-20 символов",
    errUsernameInvalid: "Имя пользователя может содержать только буквы, числа, точки, подчеркивания и дефисы",
    terminalInit: "FoxChat Terminal v2.5.0",
    terminalConnect: "Инициализация безопасного соединения...",
    terminalEncrypt: "Загрузка протоколов шифрования...",
    terminalWebsocket: "Установка WebSocket моста...",
    terminalReady: "Готов к безопасной связи.",
    terminalSkip: "Нажмите любую клавишу для продолжения...",
    passwordRequired: "Требуется пароль",
    passwordRequiredDesc: "Эта комната защищена паролем. Введите пароль для входа в комнату",
    cancel: "Отмена",
    unlock: "Разблокировать"
  },
  ar: {
    title: "فوكس تشات",
    subtitle: "غرف دردشة فورية مع الخصوصية",
    labelLang: "اللغة:",
    labelUserName: "اسم المستخدم:",
    labelSeed: "رمز الغرفة (Seed):",
    labelPassword: "كلمة المرور (اختيارية):",
    joinBtn: "دخول الغرفة",
    usernamePlaceholder: "أدخل اسمك",
    seedPlaceholder: "أدخل رمز الغرفة (اتركه فارغًا للعشوائي)",
    passwordPlaceholder: "أدخل كلمة المرور إذا لزم الأمر",
    msgPlaceholder: "اكتب رسالتك...",
    sendBtn: "إرسال",
    leaveBtn: "خروج",
    chatRoom: "غرفة الدردشة",
    roomAdmin: "مدير الغرفة",
    commands: "الأوامر",
    onlineUsers: "المستخدمون المتصلون",
    status: "الحالة",
    connected: "متصل",
    disconnected: "غير متصل",
    you: "أنت",
    disclaimerNoStore: "هذا الموقع لا يخزن بيانات المستخدمين مركزياً.",
    disclaimerRAM: "تبقى الرسائل في الذاكرة وتمحى عند الخروج.",
    disclaimerShared: "الغرفة مشتركة بين الجميع بنفس الـ Seed.",
    disclaimerWarning: "تحذير: المستخدمون الحاضرون فقط يمكنهم رؤية الرسائل.",
    errUsernameLength: "يجب أن يكون اسم المستخدم بين 2-20 حرف",
    errUsernameInvalid: "اسم المستخدم يمكن أن يحتوي فقط على أحرف وأرقام ونقاط وشرطات سفلية وشرطات",
    terminalInit: "FoxChat Terminal v2.5.0",
    terminalConnect: "بدء الاتصال الآمن...",
    terminalEncrypt: "تحميل بروتوكولات التشفير...",
    terminalWebsocket: "إنشاء جسر WebSocket...",
    terminalReady: "جاهز للتواصل الآمن.",
    terminalSkip: "اضغط أي مفتاح للمتابعة...",
    passwordRequired: "كلمة المرور مطلوبة",
    passwordRequiredDesc: "هذه الغرفة محمية بكلمة مرور. أدخل كلمة المرور للانضمام إلى الغرفة",
    cancel: "إلغاء",
    unlock: "إلغاء القفل"
  }
};

let currentLanguage = "en";

export function setLanguage(lang: string) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem("foxchat-language", lang);
  }
}

export function getCurrentLanguage(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("foxchat-language");
    if (saved && translations[saved]) {
      currentLanguage = saved;
      return saved;
    }
  }
  return currentLanguage;
}

export function getTranslation(key: string): string {
  return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

// Initialize language from localStorage on load
if (typeof window !== "undefined") {
  getCurrentLanguage();
}
