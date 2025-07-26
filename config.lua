Config = {}

-- Localization settings
Config.Locale = 'en' -- Available: 'cs', 'en'

-- Maximální počet účtů na hráče
Config.MaxAccounts = 2

-- Minimální částka pro transakce v $
Config.MinTransactionAmount = 1

-- Defaultní názvy účtů
Config.DefaultAccountNames = {
    'Main Account',
    'Secondary Account'
}

-- Ox Target pozice pro banky
Config.BankTargets = {
    {
        coords = vector3(313.39, -279.53, 54.16),
        size = vector3(3.0, 3.0, 3.0),
        rotation = 337.0,
        label = 'Open bank - Legion Square'
    },
    {
        coords = vector3(-2962.50, 482.69, 15.70),
        size = vector3(2.0, 2.0, 2.0),
        rotation = 87.86,
        label = 'Open bank - Great Ocean Highway'
    }
}

-- ox target nastavení
Config.TargetDistance = 2.0
Config.TargetIcon = 'fas fa-credit-card'
Config.TargetLabel = 'Use ATM'

-- Konfigurace blipů pro banky
Config.BankBlips = {
    enabled = true,                    -- Povolit/zakázat blips
    sprite = 500,                      -- ID blip sprite (106 = banka)
    display = 2,                       -- Typ zobrazení (4 = vždy zobrazit)
    scale = 0.6,                       -- Velikost blipu
    color = 2,                         -- Barva blipu (2 = zelená)
    name = "Bank",                    -- Název blipu na mapě
    shortRange = true                  -- Zobrazit pouze na krátkou vzdálenost
}

-- Notifikace styly
Config.NotificationTypes = {
    success = 'success',
    error = 'error',
    info = 'info'
}

-- ATM modely
Config.BankModels = {
    'prop_atm_01',
    'prop_atm_02', 
    'prop_atm_03',
    'prop_fleeca_atm'
}

-- Discord webhook pro logy
Config.Webhook = {
    enabled = true,
    url = "YOUR-WEBHOOK",
    name = "Jakubko Banking",
    avatar = "https://i.imgur.com/4M34hi2.png"
}

-- Initialize localization
Locales = {}

function _U(str, ...)
    if Locales[Config.Locale] and Locales[Config.Locale][str] then
        return string.format(Locales[Config.Locale][str], ...)
    else
        return 'Translation [' .. Config.Locale .. '][' .. str .. '] does not exist'
    end
end