var storage = {
    get: function (key) {
        var value = window.localStorage[key];
        return value ? JSON.parse(value) : null;
    },
    set: function (key, value) {
        window.localStorage[key] = JSON.stringify(value);
    },
    remove: function (key) {
        window.localStorage.removeItem(key);
    }
};

function getSettings() {
    var defaults = {
        ver: '0.0',
        user: {name: ''}
    };

    var settings = storage.get('appSettings');
    if (!settings || settings.ver != defaults.ver) {
        storage.set('appSettings', defaults);
        settings = $.extend({}, defaults);
    }
    settings.save = function () {
        storage.set('appSettings', this);
    };

    return settings;
}