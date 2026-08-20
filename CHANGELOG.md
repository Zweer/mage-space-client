# Changelog

## [1.0.2](https://github.com/Zweer/mage-space-client/compare/v1.0.1...v1.0.2) (2026-08-20)


### Bug Fixes

* 🐛 detect HTML fallback as stale hash (auto-rediscover on deploy) ([1fa93e7](https://github.com/Zweer/mage-space-client/commit/1fa93e794e81e247087b6118e5aebe4419bc931b))

## [1.0.1](https://github.com/Zweer/mage-space-client/compare/v1.0.0...v1.0.1) (2026-08-07)


### Bug Fixes

* **actions:** :bug: fall back to chunk response for x-deployment-id ([c648771](https://github.com/Zweer/mage-space-client/commit/c6487714047ec2139c5dc8112e878217ddd9d988))

## 1.0.0 (2026-08-07)


### Features

* :tada: initial project setup with Kiro agent architecture ([6e9d39e](https://github.com/Zweer/mage-space-client/commit/6e9d39e442d82460ef5b9fd19dc8416f7b630ff6))
* **characters:** :sparkles: add voice generation and follow/unfollow ([e52ed6d](https://github.com/Zweer/mage-space-client/commit/e52ed6d7d9d5a53ac7e1f11e37c7f879e61c304b))
* **client:** :sparkles: implement characters, references, video and history management ([e0152ac](https://github.com/Zweer/mage-space-client/commit/e0152acdfe11d59a2b245d43d1c79474f823260d))
* **client:** :sparkles: implement MVP (discovery, auth, generation, history) ([bf1e23e](https://github.com/Zweer/mage-space-client/commit/bf1e23e93965b81e70ae11f6252cd257fe434f58))
* **references:** :sparkles: add deleteReference and make action discovery multi-page ([23600ed](https://github.com/Zweer/mage-space-client/commit/23600edb7db20f4ffc56b3a3036111d538f6efda))


### Bug Fixes

* **build:** :bug: add node to tsconfig types so Web API globals resolve ([218b734](https://github.com/Zweer/mage-space-client/commit/218b734ad79e6cc851d6ec1ce408b34935c5f85f))
* **rsc:** :bug: robust Flight parsing for list/parallel responses ([7b84e42](https://github.com/Zweer/mage-space-client/commit/7b84e422ace7fafa5963a0ab837fcac8f91ccee8))
