fx_version 'cerulean'
games { 'gta5' }
lua54 'yes'

author 'Jakubko'
description 'Modern Banking System with Localization'
version '1.1.0'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
    'locales/*.lua'
}

client_scripts {
    'client.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js'
}

dependencies {
    'es_extended',
    'oxmysql',
    'ox_target',
    'ox_lib'
}

escrow_ignore {
    'config.lua',
    'locales/*.lua'
}
dependency '/assetpacks'