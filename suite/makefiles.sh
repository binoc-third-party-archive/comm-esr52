# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is the SeaMonkey code.
#
# The Initial Developer of the Original Code is
# The SeaMonkey project at mozilla.org.
# Portions created by the Initial Developer are Copyright (C) 2007
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#  Robert Kaiser <kairo@kairo.at>
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

if [ "$COMM_BUILD" ]; then
add_makefiles "
  suite/Makefile
  suite/app/Makefile
  suite/browser/Makefile
  suite/build/Makefile
  suite/debugQA/Makefile
  suite/debugQA/locales/Makefile
  suite/common/Makefile
  suite/common/public/Makefile
  suite/common/src/Makefile
  suite/common/tests/Makefile
  suite/components/Makefile
  suite/feeds/public/Makefile
  suite/feeds/src/Makefile
  suite/installer/Makefile
  suite/installer/windows/Makefile
  suite/locales/Makefile
  suite/mailnews/Makefile
  suite/modules/Makefile
  suite/modules/test/Makefile
  suite/profile/Makefile
  suite/profile/migration/public/Makefile
  suite/profile/migration/src/Makefile
  suite/shell/public/Makefile
  suite/shell/src/Makefile
  suite/smile/Makefile
  suite/themes/modern/Makefile
  suite/themes/classic/Makefile
  $MOZ_BRANDING_DIRECTORY/Makefile
"
fi
