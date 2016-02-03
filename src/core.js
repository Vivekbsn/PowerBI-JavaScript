(function (powerbi) {
    'use strict';
    
    var embeds = [];

    powerbi.get = get;
    powerbi.embed = embed;    

    activate();
    
    //////////////////////////////////
    
    function activate() {
        window.addEventListener('DOMContentLoaded', onLoad, false);
        window.addEventListener('message', onReceiveMessage, false);
    }

    var componentTypes = [
        { type: 'powerbi-tile', component: powerbi.Tile },
        { type: 'powerbi-report', component: powerbi.Report }
    ];

    var EmbedEventMap = {
        'tileClicked': 'tile-click',
        'tileLoaded': 'tile-load',
        'reportPageLoaded': 'report-load'
    };
    
    function onLoad() {
        var components = document.querySelectorAll('[powerbi-embed]');
        for (var i = 0; i < components.length; i++) {
            embed(components[i]);
        }
    }

    function get(element) {
        return element.powerBIEmbed || embed(element);
    }

    function embed(element) {
        var instance;

        for (var j = 0; j < componentTypes.length; j++) {
            var componentType = componentTypes[j];

            if (element.getAttribute(componentType.type) !== null) {
                instance = new componentType.component(element);
                element.powerBIEmbed = instance;
                embeds.push(instance);
                break;
            }
        }

        return instance;
    }

    function onReceiveMessage(event) {
        if (!event) {
            return;
        }

        try {
            var messageData = JSON.parse(event.data);
            for (var i = 0; i < embeds.length; i++) {
                var embed = embeds[i];

                // Only raise the event on the embed that matches the post message origin
                if (event.source === embed.iframe.contentWindow) {
                    powerbi.utils.raiseCustomEvent(embed.element, EmbedEventMap[messageData.event], messageData);
                }
            }
        }
        catch (e) {
            if (typeof (window.powerbi.onError) === 'function') {
                window.powerbi.onError.call(window, e);
            }
        }
    }
} (window.powerbi = window.powerbi || {}));