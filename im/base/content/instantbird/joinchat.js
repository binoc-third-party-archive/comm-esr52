/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Instantbird messenging client, released
 * 2007.
 *
 * The Initial Developer of the Original Code is
 * Florian QUEZE <florian@instantbird.org>.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const autoJoinPref = "autoJoin";

var joinChat = {
  onload: function jc_onload() {
    this.pcs = Components.classes["@instantbird.org/purple/core;1"]
                         .getService(Ci.purpleICoreService);
    this.buildAccountList();
  },

  buildAccountList: function jc_buildAccountList() {
    var accountList = document.getElementById("accountlist");
    for (let acc in this.getAccounts()) {
      if (!acc.connected)
        continue;
      var proto = acc.protocol;
      if (proto.id != "prpl-irc")
        continue;
      var item = accountList.appendItem(acc.name, acc.id, proto.name);
      item.setAttribute("image", "chrome://instantbird/skin/prpl/" + proto.id + ".png");
      item.setAttribute("class", "menuitem-iconic");
    }
    if (!accountList.itemCount) {
      document.getElementById("joinChatDialog").cancelDialog();
      throw "No connected IRC account!";
    }
    accountList.selectedIndex = 0;
  },

  getValue: function jc_getValue(aId) {
    var elt = document.getElementById(aId);
    return elt.value;
  },

  join: function jc_join() {
    var account = this.pcs.getAccountById(this.getValue("accountlist"));
    var name = this.getValue("name")
    var conv = account.joinChat(name);

    if (document.getElementById("autojoin").checked) {
      var prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
                                 .getService(Ci.nsIPrefService)
                                 .getBranch("messenger.account." + account.id + ".");
      var autojoin = [ ];
      if (prefBranch.prefHasUserValue(autoJoinPref)) {
        var prefValue = prefBranch.getCharPref(autoJoinPref);
        if (prefValue)
          autojoin = prefValue.split(",");
      }

      if (autojoin.indexOf(name) == -1) {
        autojoin.push(name);
        prefBranch.setCharPref(autoJoinPref, autojoin.join(","));
      }
    }

    // if the conversation is being created, |conv| will be null
    // here. The new-conversation notification should be used to focus
    // it when done.  If it is already opened, we should focus it now.
    if (!conv)
      return;

    Components.utils.import("resource://app/modules/imWindows.jsm");
    Conversations.focusConversation(conv);
  },

  getAccounts: function jc_getAccounts() {
    return getIter(this.pcs.getAccounts());
  }
};
