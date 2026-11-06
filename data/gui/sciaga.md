# Ściąga: kontrolki i zdarzenia w różnych technologiach

Na egzaminie INF.04 aplikację desktopową, mobilną i webową możesz wykonać w **dowolnej** z poniższych technologii. Wymagania arkusza zawsze opisują to samo: *pole tekstowe*, *przycisk*, *etykieta*, *lista*, *pole wyboru*. Ta tabela pokazuje, jak nazywa się dana rzecz w każdej z nich.

> [!CKE]
> Egzaminator ocenia **efekt**: czy kontrolki istnieją, mają wymagane nazwy i teksty, a aplikacja reaguje poprawnie. Wybierz technologię, którą znasz najlepiej – nie ma punktów za „trudniejszą”.

## Kontrolki

| Element | WPF (XAML) | Windows Forms | .NET MAUI | Android (XML) | JavaFX (FXML) | HTML / React / Angular |
|---|---|---|---|---|---|---|
| Etykieta | `TextBlock`, `Label` | `Label` | `Label` | `TextView` | `Label` | `<p>`, `<span>`, `<label>` |
| Pole tekstowe | `TextBox` | `TextBox` | `Entry` | `EditText` | `TextField` | `<input type="text">` |
| Pole wieloliniowe | `TextBox AcceptsReturn="True"` | `TextBox Multiline=true` | `Editor` | `EditText` + `inputType="textMultiLine"` | `TextArea` | `<textarea>` |
| Przycisk | `Button` | `Button` | `Button` | `Button` | `Button` | `<button>` |
| Pole wyboru | `CheckBox` | `CheckBox` | `CheckBox` | `CheckBox` | `CheckBox` | `<input type="checkbox">` |
| Przełącznik opcji | `RadioButton` + `GroupName` | `RadioButton` w `GroupBox` | `RadioButton` + `GroupName` | `RadioButton` w `RadioGroup` | `RadioButton` + `ToggleGroup` | `<input type="radio" name="…">` |
| Lista rozwijana | `ComboBox` | `ComboBox` | `Picker` | `Spinner` | `ComboBox`, `ChoiceBox` | `<select>` |
| Lista elementów | `ListBox`, `ListView` | `ListBox` | `CollectionView`, `ListView` | `ListView`, `RecyclerView` | `ListView` | `<ul>`, `<ol>` |
| Suwak | `Slider` | `TrackBar` | `Slider` | `SeekBar` | `Slider` | `<input type="range">` |
| Obraz | `Image Source="…"` | `PictureBox` | `Image Source="…"` | `ImageView` + `src` | `ImageView` | `<img src="…" alt="…">` |
| Data | `DatePicker` | `DateTimePicker` | `DatePicker` | `DatePicker` | `DatePicker` | `<input type="date">` |

## Nazwa (identyfikator) kontrolki

| Technologia | Jak nadać nazwę | Jak się do niej odwołać w kodzie |
|---|---|---|
| WPF, MAUI | `x:Name="txtImie"` | `txtImie.Text` |
| Windows Forms | właściwość **(Name)** w oknie Właściwości | `txtImie.Text` |
| Android | `android:id="@+id/etImie"` | Java: `findViewById(R.id.etImie)`; Kotlin: `findViewById<EditText>(R.id.etImie)` |
| JavaFX | `fx:id="txtImie"` | pole `@FXML private TextField txtImie;` w kontrolerze |
| HTML / JS | `id="imie"` | `document.getElementById('imie')` |
| React | `id="imie"` (dla testów/CSS) | stan: `value={imie}` + `onChange` |
| Angular | `id="imie"` | `[(ngModel)]="imie"` – pole klasy komponentu |

> [!PULAPKA]
> W JavaFX nazwa pola w kontrolerze musi być **identyczna** z `fx:id`, a pole musi mieć adnotację `@FXML` – inaczej dostaniesz `NullPointerException`.

## Zdarzenie kliknięcia

| Technologia | Layout | Kod |
|---|---|---|
| WPF | `Click="btnOk_Click"` | `private void btnOk_Click(object sender, RoutedEventArgs e)` |
| Windows Forms | dwuklik na przycisku w projektancie | `this.btnOk.Click += new EventHandler(this.btnOk_Click);` + `private void btnOk_Click(object sender, EventArgs e)` |
| .NET MAUI | `Clicked="OnOkClicked"` | `private void OnOkClicked(object sender, EventArgs e)` |
| Android (Java) | – | `btnOk.setOnClickListener(v -> { … });` |
| Android (Kotlin) | – | `btnOk.setOnClickListener { … }` |
| JavaFX | `onAction="#onOk"` | `@FXML private void onOk() { … }` |
| JavaScript | – | `btn.addEventListener('click', funkcja);` |
| React | `onClick={funkcja}` | `const funkcja = () => { … };` |
| Angular | `(click)="funkcja()"` | metoda klasy `funkcja(): void { … }` |

## Odczyt i zapis tekstu

| Technologia | Odczyt | Zapis |
|---|---|---|
| WPF / WinForms / MAUI | `txtImie.Text` | `lblWynik.Text = "…";` (WPF `Label` → `Content`) |
| Android (Java) | `etImie.getText().toString()` | `tvWynik.setText("…");` |
| Android (Kotlin) | `etImie.text.toString()` | `tvWynik.text = "…"` |
| JavaFX | `txtImie.getText()` | `lblWynik.setText("…");` |
| JavaScript | `el.value` | `el.textContent = '…';` |
| React | stan `imie` | `setWynik('…')` → `{wynik}` w JSX |
| Angular | pole `this.imie` | `this.wynik = '…'` → `{{ wynik }}` w szablonie |

## Pola wyboru i listy

| Technologia | Czy zaznaczony? | Wybrana pozycja listy |
|---|---|---|
| WPF | `chk.IsChecked == true` | `cmb.SelectedItem`, `cmb.Text`, `cmb.SelectedIndex` |
| Windows Forms | `chk.Checked` | `cmb.SelectedItem`, `cmb.Text` |
| .NET MAUI | `chk.IsChecked` | `picker.SelectedItem`, `picker.SelectedIndex` |
| Android | `cb.isChecked()` / `cb.isChecked` | `spinner.getSelectedItem().toString()` |
| JavaFX | `chk.isSelected()` | `cmb.getValue()` |
| JavaScript | `el.checked` | `select.value` |
| React | `checked={zgoda}` + `onChange={e => setZgoda(e.target.checked)}` | `value={gatunek}` + `onChange` |
| Angular | `[(ngModel)]="zgoda"` na checkboxie | `[(ngModel)]="gatunek"` na `<select>` |

## Konwersja tekstu na liczbę

| Język | Bezpiecznie | Uwagi |
|---|---|---|
| C# | `double.TryParse(t, out double x)` | `double.Parse` rzuca `FormatException`; przecinek zależy od kultury → `CultureInfo.InvariantCulture` |
| Java | `Double.parseDouble(t)` w `try/catch (NumberFormatException e)` | `Integer.parseInt` dla liczb całkowitych |
| Kotlin | `t.toDoubleOrNull()` | zwraca `null` zamiast wyjątku |
| JavaScript / TS | `Number(t)` + `Number.isNaN(x)` | `Number('')` = `0` – puste pole sprawdź osobno; `parseInt('12abc')` = `12` |

## Formatowanie wyniku (1 miejsce po przecinku)

| Język | Kod | Wynik dla 77 |
|---|---|---|
| C# | `x.ToString("F1", CultureInfo.InvariantCulture)` | `77.0` |
| C# (interpolacja) | `$"{x:F1}"` | `77,0` na polskim systemie! |
| Java | `String.format(Locale.US, "%.1f", x)` | `77.0` |
| Kotlin | `"%.1f".format(Locale.US, x)` | `77.0` |
| JavaScript / TS | `x.toFixed(1)` | `77.0` |

## Okna dialogowe / komunikaty

| Technologia | Kod |
|---|---|
| WPF / Windows Forms | `MessageBox.Show("Treść", "Tytuł");` |
| .NET MAUI | `await DisplayAlert("Tytuł", "Treść", "OK");` |
| Android | `Toast.makeText(this, "Treść", Toast.LENGTH_SHORT).show();` |
| JavaFX | `new Alert(Alert.AlertType.INFORMATION, "Treść").showAndWait();` |
| JavaScript | `alert('Treść');` (na egzaminie częściej wpis do akapitu) |

## Układ (layout)

| Technologia | Pionowo | Siatka |
|---|---|---|
| WPF | `StackPanel` | `Grid` + `Grid.Row` / `Grid.Column` |
| .NET MAUI | `VerticalStackLayout` | `Grid` |
| Android | `LinearLayout android:orientation="vertical"` | `ConstraintLayout`, `GridLayout` |
| JavaFX | `VBox` | `GridPane` |
| HTML/CSS | `display: flex; flex-direction: column;` | `display: grid;` |

> [!INFO]
> W Androidzie każdy element **musi** mieć `android:layout_width` i `android:layout_height` (`match_parent`, `wrap_content` lub wymiar w `dp`). Rozmiar tekstu podawaj w `sp`.

## Stan w aplikacjach webowych

| | React | Angular |
|---|---|---|
| Zmienna stanu | `const [n, setN] = useState(0);` | pole klasy `n = 0;` |
| Zmiana | `setN(n + 1)` | `this.n++` |
| Wyświetlenie | `{n}` | `{{ n }}` |
| Warunek | `{blad && <p>{blad}</p>}` | `@if (blad) { <p>{{ blad }}</p> }` lub `*ngIf` |
| Pętla | `{lista.map(x => <li key={x.id}>{x.nazwa}</li>)}` | `@for (x of lista; track x.id) { <li>{{ x.nazwa }}</li> }` lub `*ngFor` |
| Pole formularza | `value` + `onChange` | `[(ngModel)]` + `FormsModule` |
