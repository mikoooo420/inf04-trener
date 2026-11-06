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

### Windows Forms – kod obsługi

Projektant zapisuje kontrolki w `Form1.Designer.cs` (metoda `InitializeComponent`), a my piszemy obsługę w `Form1.cs`. Dwuklik na przycisku w projektancie tworzy metodę i podpina ją: `btnOk.Click += btnOk_Click;`.

```csharp
private void btnOk_Click(object sender, EventArgs e)
{
    if (!int.TryParse(txtWiek.Text, out int wiek))
    {
        MessageBox.Show("Podaj liczbę!");
        return;
    }
    lblWynik.Text = wiek >= 18 ? "Pełnoletni" : "Niepełnoletni";
    lblWynik.ForeColor = wiek >= 18 ? Color.Green : Color.Red;
}
```

### JavaFX i FXML

Widok opisuje plik **FXML** (można go „wyklikać” w **Scene Builderze**), logikę – klasa **kontrolera**. Kontrolki łączy atrybut `fx:id` i adnotacja `@FXML`, a zdarzenia – `onAction="#metoda"`.

```xml
<VBox xmlns:fx="http://javafx.com/fxml" fx:controller="app.MainController" spacing="10">
    <TextField fx:id="txtImie"/>
    <Button text="Powitaj" onAction="#onPowitaj"/>
    <Label fx:id="lblWynik"/>
</VBox>
```

```java
public class MainController {
    @FXML private TextField txtImie;
    @FXML private Label lblWynik;

    @FXML
    private void onPowitaj() {
        lblWynik.setText("Cześć, " + txtImie.getText() + "!");
    }
}
```

Kontenery: `VBox`/`HBox` (pionowo/poziomo), `GridPane` (siatka), `BorderPane` (top/left/center/right/bottom). Hierarchia okna: **Stage** (okno) → **Scene** (scena) → węzły (*nodes*). Wygląd zmienia się CSS-em z prefiksem `-fx-` (np. `-fx-background-color`).

### .NET MAUI

Jeden projekt C# + XAML działa na **Androidzie, iOS, Windows i macOS**. Kontrolki różnią się nazwami od WPF: **`Entry`** (pole tekstowe), **`Editor`** (wieloliniowe), **`Picker`** (lista rozwijana), **`CollectionView`** (lista), układy **`VerticalStackLayout`**, **`HorizontalStackLayout`**, **`Grid`**. Kliknięcie przycisku to zdarzenie **`Clicked`**, a tekst przycisku – właściwość **`Text`**.

```csharp
private async void OnZapiszClicked(object sender, EventArgs e)
{
    if (string.IsNullOrWhiteSpace(txtImie.Text))
    {
        await DisplayAlert("Błąd", "Podaj imię", "OK");
        return;
    }
    lblWynik.Text = $"Zapisano: {txtImie.Text}";
}
```

### Wiązanie danych i MVVM

**Binding** łączy właściwość kontrolki z właściwością obiektu danych – zmiana jednej automatycznie aktualizuje drugą: `<TextBox Text="{Binding Imie, Mode=TwoWay}"/>`. Obiekt danych to **DataContext** (WPF) lub **BindingContext** (MAUI), a o zmianach powiadamia interfejs **`INotifyPropertyChanged`**.

**MVVM** (*Model–View–ViewModel*): **Model** – dane i logika biznesowa, **View** – XAML bez logiki, **ViewModel** – właściwości i polecenia (`ICommand`) dla widoku. Dzięki temu logikę można testować bez interfejsu.

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

To samo w **Kotlinie** – krócej, bez średników, z lambdą w nawiasach klamrowych:

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val btn = findViewById<Button>(R.id.btnOk)
        val tv = findViewById<TextView>(R.id.tvWynik)
        btn.setOnClickListener { tv.text = "Kliknięto!" }
    }
}
```

Kotlin w pigułce: `val` – stała, `var` – zmienna, typy po dwukropku (`var wiek: Int = 17`), **null safety** (`String?` może być `null`, operator `?.` i `?:`), szablony napisów `"Wiek: $wiek"`, `when` zamiast `switch`, `"12".toIntOrNull()` zwraca `null` zamiast wyjątku. Komunikat w Androidzie: `Toast.makeText(this, "Zapisano", Toast.LENGTH_SHORT).show()`.

> [!CKE]
> Przećwicz to w **Pracowni GUI** – te same ćwiczenia w WPF, Windows Forms, JavaFX, .NET MAUI, Androidzie (Java i Kotlin), React i Angularze, a w **arkuszach praktycznych** wybierz technologię części z interfejsem. Porównanie kontrolek znajdziesz w ściądze Pracowni GUI.

> [!PULAPKA]
> Jednostki w Androidzie: wymiary podajemy w **dp** (piksele niezależne od gęstości ekranu), a rozmiar czcionki w **sp** (skaluje się z ustawieniami użytkownika). Zwykłe piksele (`px`) wyglądają różnie na różnych ekranach.

## Inne podejścia mobilne

- **Aplikacje natywne** – osobno dla Androida (Kotlin/Java) i iOS (Swift); najlepsza wydajność,
- **Wieloplatformowe** – jeden kod: **.NET MAUI** (C#), **Flutter** (Dart), **React Native** (JavaScript),
- **PWA** (*Progressive Web App*) – aplikacja webowa instalowana na urządzeniu, działająca offline dzięki Service Workerowi,
- **Emulator** (AVD w Android Studio) pozwala testować aplikację bez fizycznego telefonu.

> [!INFO]
> Aplikacja mobilna musi uwzględniać: różne rozmiary i orientacje ekranu, oszczędzanie baterii, przerwanie działania (np. połączenie przychodzące) oraz **uprawnienia** (aparat, lokalizacja) przyznawane przez użytkownika.
