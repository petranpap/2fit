<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Concerns\HasLocationFields;
use App\Filament\Partner\Resources\TrainerResource\Pages;
use App\Models\Trainer;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class TrainerResource extends Resource
{
    use HasLocationFields;

    protected static ?string $model = Trainer::class;

    protected static ?string $navigationIcon = 'heroicon-o-user';

    public static function getNavigationLabel(): string
    {
        return __('partner.nav.trainer');
    }

    public static function getModelLabel(): string
    {
        return __('partner.model.trainer');
    }

    public static function getPluralModelLabel(): string
    {
        return __('partner.model.trainers');
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')->label(__('partner.fields.name'))
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (string $state, callable $set) => $set('slug', Str::slug($state))),
            TextInput::make('slug')->label(__('partner.fields.slug'))
                ->required()
                ->maxLength(255)
                ->unique(ignoreRecord: true),
            Textarea::make('bio')->label(__('partner.fields.bio'))
                ->maxLength(2000)
                ->columnSpanFull(),
            Select::make('spoken_languages')
                ->label(fn () => app()->getLocale() === 'el' ? 'Γλώσσες που γνωρίζω' : 'Languages spoken')
                ->options([
                    'el' => 'Ελληνικά / Greek',
                    'en' => 'Αγγλικά / English',
                    'ru' => 'Ρωσικά / Russian',
                    'fr' => 'Γαλλικά / French',
                    'de' => 'Γερμανικά / German',
                    'es' => 'Ισπανικά / Spanish',
                    'ar' => 'Αραβικά / Arabic',
                    'tr' => 'Τουρκικά / Turkish',
                    'other' => 'Άλλη / Other',
                ])
                ->multiple()
                ->searchable()
                ->preload(),
            Textarea::make('gym_education')
                ->label(fn () => app()->getLocale() === 'el' ? 'Σπουδές / Εκπαίδευση στη γυμναστική' : 'Gym / Fitness Education')
                ->helperText(fn () => app()->getLocale() === 'el' ? 'Σχολή, πτυχίο, έτος και φορέας.' : 'School, degree, year and awarding institution.')
                ->maxLength(4000)
                ->columnSpanFull(),
            Textarea::make('gym_training')
                ->label(fn () => app()->getLocale() === 'el' ? 'Επαγγελματική κατάρτιση / Σεμινάρια' : 'Gym Training / Certifications')
                ->helperText(fn () => app()->getLocale() === 'el' ? 'Σεμινάρια, πιστοποιήσεις και πρακτική κατάρτιση.' : 'Courses, certificates and practical training.')
                ->maxLength(4000)
                ->columnSpanFull(),
            Toggle::make('qualification_declaration')
                ->label(fn () => app()->getLocale() === 'el' ? 'Δηλώνω ότι τα στοιχεία εκπαίδευσης και κατάρτισης είναι αληθή' : 'I declare that my education and training details are true')
                ->helperText(fn () => app()->getLocale() === 'el' ? 'Προσωπική δήλωση, όχι επίσημη επαλήθευση από το 2Fit.' : 'Self-declaration; not verification by 2Fit.')
                ->default(false),
            TextInput::make('address')->label(__('partner.fields.address'))->maxLength(255),
            ...self::locationFields(),
            TextInput::make('phone')->label(__('partner.fields.phone'))->tel()->maxLength(30),
            TextInput::make('email')->label(__('partner.fields.email'))->email()->maxLength(255),
            TextInput::make('hourly_rate')->label(__('partner.fields.hourly_rate'))
                ->numeric()
                ->prefix('€'),
            FileUpload::make('photo_path')->label(__('partner.fields.photo_path'))
                ->label(__('partner.fields.photo_path'))
                ->image()
                ->disk('public')
                ->directory('trainers/photos'),
            Select::make('categories')->label(__('partner.fields.categories'))
                ->relationship('categories', 'name', fn (Builder $query) => $query->whereNotNull('parent_id'))
                ->multiple()
                ->preload(),
            Toggle::make('is_active')->label(__('partner.fields.is_active'))
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label(__('partner.fields.name'))->searchable(),
                TextColumn::make('hourly_rate')->label(__('partner.fields.hourly_rate'))->money('EUR'),
                IconColumn::make('is_verified')->label(__('partner.fields.is_verified'))->boolean(),
                IconColumn::make('is_active')->label(__('partner.fields.is_active'))->boolean(),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('user_id', auth()->id());
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()?->role === 'trainer';
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTrainers::route('/'),
            'create' => Pages\CreateTrainer::route('/create'),
            'edit' => Pages\EditTrainer::route('/{record}/edit'),
        ];
    }
}
