#define MyAppName "NYX Proxy Bridge"
#define MyAppVersion "1.0.0"
#define MyAppExeName "NyxProxyBridge.exe"

[Setup]
AppId={{A4F7F5D2-5B8B-4F83-9B5E-3E5A1D3A8C21}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher=NYX
DefaultDirName={autopf}\NYX Proxy Bridge
DefaultGroupName=NYX Proxy Bridge
DisableProgramGroupPage=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
WizardStyle=modern
WizardSizePercent=110
Compression=lzma2/ultra64
SolidCompression=yes
OutputDir=Output
OutputBaseFilename=NYXProxyBridge_Setup
UninstallDisplayName={#MyAppName}
UninstallDisplayIcon={app}\{#MyAppExeName}
SetupLogging=yes
CloseApplications=yes
RestartApplications=no
UsePreviousAppDir=yes
ShowLanguageDialog=no
LanguageDetectionMethod=uilanguage

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Создать ярлык на рабочем столе"; GroupDescription: "Дополнительные ярлыки:"; Flags: unchecked

[Files]
Source: "payload\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\NYX Proxy Bridge"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\NYX Proxy Bridge"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Запустить NYX Proxy Bridge"; Flags: postinstall nowait skipifsilent
