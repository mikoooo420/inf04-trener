---
title: Aplikacje desktopowe i mobilne
---

## Programowanie zdarzeniowe

Aplikacje z graficznym interfejsem (GUI) działają w modelu **zdarzeniowym**: program czeka na **zdarzenia** (kliknięcie, wpisanie tekstu, zmiana zaznaczenia) i wykonuje przypisane do nich **procedury obsługi** (*event handlers*). Główna **pętla komunikatów** (*event loop*) pobiera zdarzenia z kolejki i przekazuje je do kontrolek.

```csharp
// WinForms / WPF – obsługa kliknięcia przycisku
private void btnOblicz_Click(object sender, EventArgs e)
{
    int a = int.Parse(txtA.Text);
    lblWynik.Text = $"Kwadrat: {a * a}";
}
```

## Kontrolki

| Kontrolka | WinForms / WPF | Android (XML) | Do czego |
|---|---|---|---|
| Etykieta | `Label` / `TextBlock` | `TextView` | wyświetlanie tekstu |
| Pole tekstowe | `TextBox` | `EditText` | wprowadzanie tekstu |
| Przycisk | `Button` | `Button` | wywołanie akcji |
| Pole wyboru | `CheckBox` | `CheckBox` | opcja tak/nie |
| Przycisk opcji | `RadioButton` | `RadioButton` (w `RadioGroup`) | wybór jednej z wielu |
| Lista rozwijana | `ComboBox` | `Spinner` | wybór z listy |
| Lista | `ListBox` / `ListView` | `ListView` / `RecyclerView` | wiele elementów |
| Suwak | `TrackBar` / `Slider` | `SeekBar` | wartość z zakresu |
| Obraz | `PictureBox` / `Image` | `ImageView` | grafika |

**Właściwości** opisują wygląd i stan kontrolki (`Text`, `Enabled`, `Visible`, `Width`, `Background`), **zdarzenia** – reakcje (`Click`, `TextChanged`, `CheckedChanged`, `SelectionChanged`).

> [!CKE]
> W arkuszach polecenie często precyzuje **nazwy kontrolek** (np. `txtImie`, `btnZatwierdz`) i ich **właściwości** (kolor tła, rozmiar czcionki, tekst domyślny). Ustaw dokładnie to, co jest w poleceniu – egzaminator sprawdza to na zrzutach ekranu i w kodzie.

## Technologie desktopowe

| Technologia | Język | Opis |
|---|---|---|
| **Windows Forms** | C# | klasyczny, prosty projektant formularzy (przeciągnij i upuść) |
| **WPF** | C# + **XAML** | deklaratywny opis interfejsu w XAML, wiązanie danych (binding), wzorzec MVVM |
| **.NET MAUI** | C# + XAML | jeden kod dla Windows, Androida, iOS i macOS (następca Xamarin.Forms) |
| **JavaFX** | Java | nowoczesny GUI dla Javy (następca Swing), opis w FXML, stylowanie CSS |
| **Qt** | C++ (także Python: PyQt/PySide) | wieloplatformowy framework GUI, mechanizm sygnałów i slotów |
| **Tkinter** | Python | prosty, wbudowany w Pythona |
| **Electron** | JavaScript/HTML/CSS | aplikacje desktopowe z technologii webowych |

### XAML – przykład (WPF / .NET MAUI)

```xml
<StackPanel Margin="10">
    <TextBlock Text="Podaj imię:" />
    <TextBox x:Name="txtImie" Width="200" />
    <Button x:Name="btnPowitaj" Content="Powitaj" Click="btnPowitaj_Click" />
</StackPanel>
```

**Kontenery układu (WPF):** `StackPanel` (elementy jeden pod drugim lub obok siebie), `Grid` (wiersze i kolumny), `WrapPanel` (zawijanie), `DockPanel` (dokowanie do krawędzi), `Canvas` (współrzędne bezwzględne).

## Aplikacje mobilne – Android

Natywne aplikacje Android tworzy się w **Android Studio** w językach **Kotlin** (zalecany przez Google) lub **Java**. Interfejs opisuje się w plikach **XML** (layouty) lub deklaratywnie w **Jetpack Compose**.

| Pojęcie | Opis |
|---|---|
| **Activity** | pojedynczy ekran aplikacji z interfejsem |
| **Fragment** | fragment interfejsu wielokrotnego użytku wewnątrz aktywności |
| **Intent** | komunikat do uruchomienia innej aktywności lub usługi |
| **AndroidManifest.xml** | deklaracja komponentów, uprawnień, ikony, nazwy aplikacji |
| **Layouty** | `LinearLayout` (liniowo), `ConstraintLayout` (więzy względem innych elementów), `FrameLayout`, `RelativeLayout` |
| **Zasoby** | `res/layout`, `res/values/strings.xml` (teksty), `res/drawable` (grafiki) |
| **APK / AAB** | pakiet instalacyjny aplikacji |

**Cykl życia aktywności:** `onCreate()` → `onStart()` → `onResume()` → (działanie) → `onPause()` → `onStop()` → `onDestroy()`. `onCreate` wywołuje się przy tworzeniu aktywności – tu ustawiamy layout (`setContentView`) i pobieramy kontrolki (`findViewById`).

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Button btn = findViewById(R.id.btnOk);
        TextView tv = findViewById(R.id.tvWynik);
        btn.setOnClickListener(v -> tv.setText("Kliknięto!"));
    }
}
```

> [!PULAPKA]
> Jednostki w Androidzie: wymiary podajemy w **dp** (piksele niezależne od gęstości ekranu), a rozmiar czcionki w **sp** (skaluje się z ustawieniami użytkownika). Zwykłe piksele (`px`) wyglądają różnie na różnych ekranach.

## Inne podejścia mobilne

- **Aplikacje natywne** – osobno dla Androida (Kotlin/Java) i iOS (Swift); najlepsza wydajność,
- **Wieloplatformowe** – jeden kod: **.NET MAUI** (C#), **Flutter** (Dart), **React Native** (JavaScript),
- **PWA** (*Progressive Web App*) – aplikacja webowa instalowana na urządzeniu, działająca offline dzięki Service Workerowi,
- **Emulator** (AVD w Android Studio) pozwala testować aplikację bez fizycznego telefonu.

> [!INFO]
> Aplikacja mobilna musi uwzględniać: różne rozmiary i orientacje ekranu, oszczędzanie baterii, przerwanie działania (np. połączenie przychodzące) oraz **uprawnienia** (aparat, lokalizacja) przyznawane przez użytkownika.
