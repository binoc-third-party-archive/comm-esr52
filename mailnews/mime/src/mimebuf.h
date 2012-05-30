/* -*- Mode: C; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * This Original Code has been modified by IBM Corporation. Modifications made by IBM
 * described herein are Copyright (c) International Business Machines Corporation, 2000.
 * Modifications to Mozilla code or documentation identified per MPL Section 3.3
 *
 * Date             Modified by     Description of modification
 * 04/20/2000       IBM Corp.      OS/2 VisualAge build.
 */

#ifndef _MIMEBUF_H_
#define _MIMEBUF_H_

extern "C" int mime_GrowBuffer (PRUint32 desired_size,
               PRUint32 element_size, PRUint32 quantum,
               char **buffer, PRInt32 *size);

extern "C" int mime_LineBuffer (const char *net_buffer, PRInt32 net_buffer_size,
               char **bufferP, PRInt32 *buffer_sizeP,
               PRInt32 *buffer_fpP,
               bool convert_newlines_p,
               PRInt32 (* per_line_fn) (char *line, PRInt32
                         line_length, void *closure),
               void *closure);

extern "C" int mime_ReBuffer (const char *net_buffer, PRInt32 net_buffer_size,
             PRUint32 desired_buffer_size,
             char **bufferP, PRUint32 *buffer_sizeP,
             PRUint32 *buffer_fpP,
             PRInt32 (*per_buffer_fn) (char *buffer,
                         PRUint32 buffer_size,
                         void *closure),
             void *closure);


#endif /* _MIMEBUF_H_ */
